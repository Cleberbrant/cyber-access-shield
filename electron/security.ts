import { BrowserWindow, session } from "electron";
import { APP_ORIGIN } from "./protocol";

/**
 * Valida a origem de frames/IPC: só o bundle empacotado (app://bundle)
 * ou o dev server do Vite são confiáveis.
 */
export function isTrustedFrame(
  frameUrl: string,
  devServerUrl?: string
): boolean {
  if (frameUrl === APP_ORIGIN || frameUrl.startsWith(`${APP_ORIGIN}/`)) {
    return true;
  }
  return Boolean(devServerUrl && frameUrl.startsWith(devServerUrl));
}

export function setupWindowSecurity(
  win: BrowserWindow,
  devServerUrl?: string
): void {
  // Navegação só dentro do app — qualquer URL externa é bloqueada
  // (política: deny, sem shell.openExternal durante prova)
  win.webContents.on("will-navigate", (event, url) => {
    if (!isTrustedFrame(url, devServerUrl)) {
      event.preventDefault();
    }
  });

  // window.open / target=_blank → sempre negado
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  // Câmera/microfone/geolocalização etc. não são usados → negar tudo
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    }
  );
}
