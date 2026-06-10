/**
 * Detecta se o app está rodando dentro do Electron (desktop).
 * Na web, window.electronAPI não existe → retorna false.
 */
export const isElectron = (): boolean =>
  typeof window !== "undefined" && window.electronAPI?.isElectron === true;
