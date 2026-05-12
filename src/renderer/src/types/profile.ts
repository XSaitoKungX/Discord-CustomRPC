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

export type CreateProfileData = Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>
