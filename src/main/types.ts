export enum ActivityType {
  PLAYING = 0,
  STREAMING = 1,
  LISTENING = 2,
  WATCHING = 3,
  COMPETING = 5
}

export enum TimestampMode {
  NONE = 0,
  NOW = 1,
  LOCAL_TIME = 2,
  CUSTOM = 3
}

export interface RPCProfile {
  id: string
  name: string
  applicationId: string
  activityType: ActivityType
  details?: string
  detailsUrl?: string
  state?: string
  stateUrl?: string
  streamUrl?: string
  largeImageKey?: string
  largeImageText?: string
  largeImageUrl?: string
  smallImageKey?: string
  smallImageText?: string
  smallImageUrl?: string
  button1Label?: string
  button1Url?: string
  button2Label?: string
  button2Url?: string
  partySize?: number
  partyMax?: number
  timestampMode: TimestampMode
  startTimestamp?: number
  endTimestamp?: number
  showElapsedTime: boolean
  createdAt: Date
  updatedAt: Date
}

export type AppTheme = 'default' | 'dark' | 'light' | 'space' | 'anime' | 'kawaii' | 'dev'

export interface AppSettings extends Record<string, unknown> {
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
  // Download progress
  progress?: {
    percent: number
    transferred: number
    total: number
    bytesPerSecond: number
  }
}
