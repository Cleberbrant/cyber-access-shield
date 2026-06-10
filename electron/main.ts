import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  IpcMainInvokeEvent,
  Menu,
} from "electron";
import path from "node:path";
import {
  APP_ORIGIN,
  registerAppProtocol,
  registerSchemePrivileges,
} from "./protocol";
import {
  enterKiosk,
  exitKiosk,
  isExamActive,
  setupKioskLifecycle,
} from "./kiosk";
import { isTrustedFrame, setupWindowSecurity } from "./security";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const isDev = Boolean(DEV_SERVER_URL);

// Uma única instância do app — segunda instância foca a existente
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  registerSchemePrivileges();

  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  const trusted = (event: IpcMainInvokeEvent): boolean =>
    isTrustedFrame(event.senderFrame?.url ?? "", DEV_SERVER_URL);

  function createWindow(): void {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        devTools: isDev,
        preload: path.join(__dirname, "preload.cjs"),
        spellcheck: false,
      },
    });

    Menu.setApplicationMenu(null);
    setupWindowSecurity(mainWindow, DEV_SERVER_URL);
    setupKioskLifecycle(mainWindow);

    mainWindow.once("ready-to-show", () => mainWindow?.show());
    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    if (isDev) {
      mainWindow.loadURL(DEV_SERVER_URL as string);
    } else {
      mainWindow.loadURL(`${APP_ORIGIN}/`);
    }
  }

  app.whenReady().then(() => {
    if (!isDev) {
      registerAppProtocol(path.join(app.getAppPath(), "dist"));
    }

    ipcMain.handle("app:get-version", (event) => {
      if (!trusted(event)) throw new Error("Untrusted IPC sender");
      return app.getVersion();
    });

    ipcMain.handle("kiosk:enter", (event) => {
      if (!trusted(event) || !mainWindow) return false;
      enterKiosk(mainWindow);
      return true;
    });

    ipcMain.handle("kiosk:exit", (event) => {
      if (!trusted(event) || !mainWindow) return false;
      exitKiosk(mainWindow);
      return true;
    });

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Bloqueia tentativa de encerrar o app durante a prova
  app.on("before-quit", (event) => {
    if (isExamActive()) event.preventDefault();
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
}
