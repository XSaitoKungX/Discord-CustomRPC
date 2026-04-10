// Returns true when running inside Electron (window.api is injected by preload)
export function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.api !== 'undefined'
}
