export interface RPCProfile {
  id: string
  name: string
  applicationId: string
  details?: string
  state?: string
  largeImageKey?: string
  largeImageText?: string
  smallImageKey?: string
  smallImageText?: string
  button1Label?: string
  button1Url?: string
  button2Label?: string
  button2Url?: string
  partySize?: number
  partyMax?: number
  showElapsedTime: boolean
  createdAt: Date
  updatedAt: Date
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
