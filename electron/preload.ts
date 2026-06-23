import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

interface SecurityEventPayload {
  type: string;
  details?: string;
}

// API mínima e de canais fixos — sem passthrough genérico de IPC.
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("app:get-version"),
  enterKioskMode: (): Promise<boolean> => ipcRenderer.invoke("kiosk:enter"),
  exitKioskMode: (): Promise<boolean> => ipcRenderer.invoke("kiosk:exit"),
  onSecurityEvent: (
    callback: (event: SecurityEventPayload) => void
  ): (() => void) => {
    const listener = (
      _event: IpcRendererEvent,
      payload: SecurityEventPayload
    ) => callback(payload);
    ipcRenderer.on("security:event", listener);
    return () => {
      ipcRenderer.removeListener("security:event", listener);
    };
  },
});
