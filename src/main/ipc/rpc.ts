import { ipcMain, BrowserWindow } from 'electron'
import DiscordRPC from 'discord-rpc'
import type { RPCProfile, RPCStatus, RPCStartResult } from '../types'

let client: DiscordRPC.Client | null = null
let currentStatus: RPCStatus = 'disconnected'
let startTimestamp: Date | null = null
let reconnectTimer: NodeJS.Timeout | null = null
let activeProfile: RPCProfile | null = null

function broadcastStatus(win: BrowserWindow | null, status: RPCStatus): void {
  currentStatus = status
  win?.webContents.send('rpc:statusChanged', status)
}

async function connectRPC(profile: RPCProfile, win: BrowserWindow | null): Promise<RPCStartResult> {
  try {
    if (client) {
      await client.destroy()
      client = null
    }

    DiscordRPC.register(profile.applicationId)
    client = new DiscordRPC.Client({ transport: 'ipc' })

    client.on('ready', async () => {
      broadcastStatus(win, 'connected')
      await setActivity(profile)
    })

    client.on('disconnected', () => {
      broadcastStatus(win, 'disconnected')
      scheduleReconnect(profile, win)
    })

    await client.login({ clientId: profile.applicationId })
    activeProfile = profile
    return { success: true }
  } catch (err) {
    broadcastStatus(win, 'error')
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

async function setActivity(profile: RPCProfile): Promise<void> {
  if (!client) return

  const activity: DiscordRPC.Presence = {}

  if (profile.details) activity.details = profile.details
  if (profile.state) activity.state = profile.state
  if (profile.largeImageKey) {
    activity.largeImageKey = profile.largeImageKey
    if (profile.largeImageText) activity.largeImageText = profile.largeImageText
  }
  if (profile.smallImageKey) {
    activity.smallImageKey = profile.smallImageKey
    if (profile.smallImageText) activity.smallImageText = profile.smallImageText
  }
  if (profile.showElapsedTime) {
    startTimestamp = startTimestamp ?? new Date()
    activity.startTimestamp = startTimestamp
  }

  const buttons: { label: string; url: string }[] = []
  if (profile.button1Label && profile.button1Url) {
    buttons.push({ label: profile.button1Label, url: profile.button1Url })
  }
  if (profile.button2Label && profile.button2Url) {
    buttons.push({ label: profile.button2Label, url: profile.button2Url })
  }
  if (buttons.length > 0) activity.buttons = buttons

  if (profile.partySize !== undefined && profile.partyMax !== undefined) {
    activity.partySize = profile.partySize
    activity.partyMax = profile.partyMax
  }

  await client.setActivity(activity)
}

function scheduleReconnect(profile: RPCProfile, win: BrowserWindow | null): void {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    connectRPC(profile, win)
  }, 5000)
}

export function registerRpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('rpc:start', async (_event, profile: RPCProfile): Promise<RPCStartResult> => {
    startTimestamp = null
    activeProfile = profile
    return connectRPC(profile, getMainWindow())
  })

  ipcMain.handle('rpc:stop', async () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    activeProfile = null
    startTimestamp = null
    if (client) {
      await client.clearActivity()
      await client.destroy()
      client = null
    }
    broadcastStatus(getMainWindow(), 'disconnected')
  })

  ipcMain.handle('rpc:status', () => currentStatus)
}

export function getActiveProfile(): RPCProfile | null {
  return activeProfile
}

export function getRpcStatus(): RPCStatus {
  return currentStatus
}

export async function stopRpc(): Promise<void> {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  activeProfile = null
  startTimestamp = null
  if (client) {
    await client.clearActivity()
    await client.destroy()
    client = null
  }
  currentStatus = 'disconnected'
}
