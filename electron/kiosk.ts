import { BrowserWindow, globalShortcut } from "electron";

/**
 * Atalhos bloqueados APENAS durante a prova (kiosk ativo).
 * Fora da prova o app fica utilizável normalmente.
 *
 * Limitações conhecidas (documentar no TCC): combos com tecla Win,
 * Alt+Tab e Ctrl+Alt+Del não são bloqueáveis sem hook nativo de teclado
 * ou Windows Assigned Access. Mitigação: kiosk + alwaysOnTop +
 * refocus automático no blur + sistema de 3 avisos existente, que
 * transforma o escape em violação registrada e punida.
 * setContentProtection cobre captura de tela no nível do compositor.
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

let examActive = false;

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

export function enterKiosk(win: BrowserWindow): void {
  if (examActive || win.isDestroyed()) return;
  examActive = true;

  win.setKiosk(true);
  win.setAlwaysOnTop(true, "screen-saver");
  // Janela excluída de screenshot/gravação no Windows (captura sai preta)
  win.setContentProtection(true);
  win.setClosable(false);

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

  globalShortcut.unregisterAll();
  if (win.isDestroyed()) return;
  win.setKiosk(false);
  win.setAlwaysOnTop(false);
  win.setContentProtection(false);
  win.setClosable(true);
}

export function setupKioskLifecycle(win: BrowserWindow): void {
  win.on("blur", () => {
    if (!examActive || win.isDestroyed()) return;
    // Refocus imediato; o useWindowBlurProtection do renderer continua
    // contando as violações (3 avisos → prova cancelada).
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
