export type RPCStatus = 'connected' | 'disconnected' | 'error'

export interface RPCStartResult {
  success: boolean
  error?: string
}

export interface UpdateStatus {
  checking: boolean
  available: boolean
  downloading: boolean
  downloaded: boolean
  version?: string
  error?: string
}

export type AppTheme = 'default' | 'dark' | 'light' | 'space' | 'anime' | 'kawaii' | 'dev'

export interface AppSettings {
  theme: AppTheme
  language: 'en'
  minimizeToTray: boolean
  startMinimized: boolean
  autostart: boolean
  updateChannel: 'stable' | 'beta'
  showOnboarding: boolean
}
