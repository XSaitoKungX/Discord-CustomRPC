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
      console.log('[RPC] Client ready, setting activity')
      broadcastStatus(win, 'connected')
      await setActivity(profile)
    })

    client.on('disconnected', () => {
      console.log('[RPC] Client disconnected')
      // Only reconnect if the user hasn't manually stopped
      if (activeProfile && activeProfile.id === profile.id) {
        broadcastStatus(win, 'disconnected')
        scheduleReconnect(profile, win)
      } else {
        broadcastStatus(win, 'disconnected')
      }
    })

    client.on('error', (err) => {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[RPC] Client error (will reconnect):', msg)
      // Don't broadcast error status for connection errors — just reconnect silently
      // Only broadcast error for non-connection issues
      const isConnectionError = msg.includes('ENOENT') || msg.includes('ECONNREFUSED') || 
        msg.includes('pipe') || msg.includes('connect')
      if (!isConnectionError) {
        broadcastStatus(win, 'error')
      }
    })

    console.log('[RPC] Connecting with clientId:', profile.applicationId)
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
    // Only reconnect if this profile is still the active one (user hasn't manually stopped)
    if (activeProfile && activeProfile.id === profile.id) {
      console.log('[RPC] Auto-reconnecting...')
      connectRPC(profile, win)
    } else {
      console.log('[RPC] Reconnect skipped - profile changed or stopped by user')
    }
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

export function registerDiscordApiHandlers(): void {
  ipcMain.handle('discord:getAssets', async (_event, appId: string) => {
    if (!appId || !/^\d+$/.test(appId)) return []
    try {
      const res = await fetch(
        `https://discord.com/api/v10/oauth2/applications/${appId}/assets`
      )
      if (!res.ok) return []
      const data = await res.json() as Array<{ id: string; name: string; type: number }>
      return data.map((a) => ({ id: a.id, name: a.name }))
    } catch {
      return []
    }
  })
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
