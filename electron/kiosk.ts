import { BrowserWindow, globalShortcut, screen } from "electron";

/**
 * Atalhos bloqueados APENAS durante a prova (kiosk ativo).
 * Fora da prova o app fica utilizável normalmente.
 *
 * Limitações conhecidas (documentar no TCC): combos com tecla Win,
 * Alt+Tab e Ctrl+Alt+Del não são bloqueáveis sem hook nativo de teclado
 * ou Windows Assigned Access. Mitigação: kiosk + alwaysOnTop +
 * refocus automático no blur + violação imediata contabilizada no
 * sistema de 3 avisos existente. setContentProtection cobre captura
 * de tela no nível do compositor. Monitores secundários são cobertos
 * por janelas de bloqueio em tela cheia.
 */
const EXAM_SHORTCUTS = [
  "PrintScreen",
  "CommandOrControl+P",
  "F12",
  "CommandOrControl+Shift+I",
  "CommandOrControl+Shift+J",
  "CommandOrControl+Shift+C",
  "CommandOrControl+U",
  "CommandOrControl+R",
  "CommandOrControl+Shift+R",
  "F5",
  "CommandOrControl+W",
  "F11",
  "Alt+F4",
];

const OVERLAY_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;background:#000;color:#e2e8f0;
    display:flex;align-items:center;justify-content:center;
    font-family:system-ui,sans-serif;user-select:none;cursor:none}
  div{text-align:center;max-width:80%}
  h1{font-size:1.6rem;margin:0 0 .5rem}
  p{font-size:1rem;opacity:.7;margin:0}
</style></head><body><div>
  <h1>&#128274; Avalia&ccedil;&atilde;o em andamento</h1>
  <p>Este monitor est&aacute; bloqueado durante a prova.</p>
</div></body></html>`;

let examActive = false;
let kioskEnteredAt = 0;
let overlays: BrowserWindow[] = [];
let examWindow: BrowserWindow | null = null;

export const isExamActive = (): boolean => examActive;

function sendSecurityEvent(
  win: BrowserWindow,
  type: string,
  details?: string
): void {
  if (!win.isDestroyed()) {
    win.webContents.send("security:event", { type, details });
  }
}

/**
 * Cobre todos os displays secundários com janelas pretas em tela cheia
 * (alwaysOnTop nível screen-saver, sem foco, fora da taskbar).
 * Sem isso, um segundo monitor fica completamente livre durante o kiosk.
 */
function coverSecondaryDisplays(win: BrowserWindow): void {
  destroyOverlays();
  if (win.isDestroyed()) return;

  const mainDisplay = screen.getDisplayMatching(win.getBounds());
  for (const display of screen.getAllDisplays()) {
    if (display.id === mainDisplay.id) continue;

    const overlay = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      frame: false,
      skipTaskbar: true,
      focusable: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      show: false,
      backgroundColor: "#000000",
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        devTools: false,
      },
    });
    overlay.setAlwaysOnTop(true, "screen-saver");
    overlay.setContentProtection(true);
    overlay.setBounds(display.bounds);
    overlay.loadURL(
      "data:text/html;charset=utf-8," + encodeURIComponent(OVERLAY_HTML)
    );
    // showInactive: não rouba o foco da janela da prova
    overlay.once("ready-to-show", () => {
      if (!overlay.isDestroyed()) overlay.showInactive();
    });
    overlays.push(overlay);
  }
}

function destroyOverlays(): void {
  for (const overlay of overlays) {
    if (!overlay.isDestroyed()) overlay.destroy();
  }
  overlays = [];
}

/** Monitor plugado/removido no meio da prova → recobrir e registrar. */
function handleDisplayChange(): void {
  if (!examActive || !examWindow || examWindow.isDestroyed()) return;
  coverSecondaryDisplays(examWindow);
  sendSecurityEvent(examWindow, "DISPLAY_CHANGE", "Configuração de monitores alterada durante a prova");
}

export function enterKiosk(win: BrowserWindow): void {
  if (examActive || win.isDestroyed()) return;
  examActive = true;
  examWindow = win;
  kioskEnteredAt = Date.now();

  win.setKiosk(true);
  win.setAlwaysOnTop(true, "screen-saver");
  // Janela excluída de screenshot/gravação no Windows (captura sai preta)
  win.setContentProtection(true);
  win.setClosable(false);

  coverSecondaryDisplays(win);
  screen.on("display-added", handleDisplayChange);
  screen.on("display-removed", handleDisplayChange);
  screen.on("display-metrics-changed", handleDisplayChange);

  for (const accelerator of EXAM_SHORTCUTS) {
    try {
      globalShortcut.register(accelerator, () => {
        sendSecurityEvent(win, "BLOCKED_SHORTCUT", accelerator);
      });
    } catch {
      // Alguns aceleradores podem não registrar dependendo do SO — backup
      // via before-input-event cobre dentro da janela.
    }
  }
}

export function exitKiosk(win: BrowserWindow): void {
  if (!examActive) return;
  examActive = false;
  examWindow = null;

  globalShortcut.unregisterAll();
  destroyOverlays();
  screen.removeListener("display-added", handleDisplayChange);
  screen.removeListener("display-removed", handleDisplayChange);
  screen.removeListener("display-metrics-changed", handleDisplayChange);

  if (win.isDestroyed()) return;
  win.setKiosk(false);
  win.setAlwaysOnTop(false);
  win.setContentProtection(false);
  win.setClosable(true);
}

export function setupKioskLifecycle(win: BrowserWindow): void {
  win.on("blur", () => {
    if (!examActive || win.isDestroyed()) return;
    // Grace period: a própria transição para kiosk dispara blur/focus
    if (Date.now() - kioskEnteredAt < 1500) return;
    // Refocus imediato + evento para o renderer CONTAR a violação na hora.
    // (O timer de 5s do useWindowBlurProtection nunca dispararia aqui,
    // porque o refocus devolve o foco antes — a contagem é via evento.)
    win.focus();
    win.moveTop();
    sendSecurityEvent(win, "WINDOW_BLUR_ELECTRON");
  });

  // Bloqueia Alt+F4 / fechar pela taskbar durante a prova
  win.on("close", (event) => {
    if (examActive) {
      event.preventDefault();
      sendSecurityEvent(win, "CLOSE_ATTEMPT_BLOCKED");
    }
  });

  // Backup in-window caso outro app tenha roubado o registro global
  win.webContents.on("before-input-event", (event, input) => {
    if (!examActive || input.type !== "keyDown") return;
    const key = input.key.toLowerCase();
    const blocked =
      key === "f12" ||
      key === "f5" ||
      key === "f11" ||
      key === "printscreen" ||
      (input.control && input.shift && ["i", "j", "c"].includes(key)) ||
      (input.control && ["u", "r", "w", "p"].includes(key)) ||
      (input.alt && key === "f4");
    if (blocked) {
      event.preventDefault();
    }
  });
}
