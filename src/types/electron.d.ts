/**
 * Tipagem da API exposta pelo preload do Electron (electron/preload.ts).
 * Na web, window.electronAPI é undefined — todos os checks são falsos.
 */
export interface ElectronSecurityEvent {
  type: string;
  details?: string;
}

export interface ElectronAPI {
  isElectron: true;
  getAppVersion(): Promise<string>;
  enterKioskMode(): Promise<boolean>;
  exitKioskMode(): Promise<boolean>;
  onSecurityEvent(
    callback: (event: ElectronSecurityEvent) => void
  ): () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
