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

export type CreateProfileData = Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>
