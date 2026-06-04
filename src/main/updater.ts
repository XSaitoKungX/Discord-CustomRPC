import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, ipcMain } from 'electron'
import type { UpdateStatus } from './types'
import { getSettings } from './ipc/settings'
import { IPC } from '../shared/ipcChannels'

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000

let currentStatus: UpdateStatus = {
  checking: false,
  available: false,
  downloading: false,
  downloaded: false
}

function applyChannelFromSettings(): void {
  let channel: 'stable' | 'beta' = 'stable'
  try {
    channel = getSettings().updateChannel
  } catch {
    // Settings store not ready yet — fall back to stable
  }
  if (channel === 'beta') {
    autoUpdater.allowPrerelease = true
    autoUpdater.channel = 'beta'
  } else {
    autoUpdater.allowPrerelease = false
    autoUpdater.channel = 'latest'
  }
  console.log(
    `[updater] Channel: ${autoUpdater.channel}, prerelease: ${autoUpdater.allowPrerelease}`
  )
}

async function runCheck(reason: string): Promise<void> {
  if (!app.isPackaged) return
  applyChannelFromSettings()
  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    console.warn(`[updater] ${reason} check failed:`, err instanceof Error ? err.message : err)
  }
}

export function setupUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  applyChannelFromSettings()

  autoUpdater.on('checking-for-update', () => {
    currentStatus = { checking: true, available: false, downloading: false, downloaded: false }
    mainWindow.webContents.send(IPC.UPDATER_STATUS, currentStatus)
  })

  autoUpdater.on('update-available', (info) => {
    currentStatus = {
      checking: false,
      available: true,
      downloading: false,
      downloaded: false,
      version: info.version
    }
    mainWindow.webContents.send(IPC.UPDATER_STATUS, currentStatus)
  })

  autoUpdater.on('update-not-available', () => {
    currentStatus = { checking: false, available: false, downloading: false, downloaded: false }
    mainWindow.webContents.send(IPC.UPDATER_STATUS, currentStatus)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    currentStatus = {
      ...currentStatus,
      downloading: true,
      progress: {
        percent: Math.round(progressObj.percent),
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      }
    }
    mainWindow.webContents.send(IPC.UPDATER_STATUS, currentStatus)
  })

  autoUpdater.on('update-downloaded', (info) => {
    currentStatus = {
      checking: false,
      available: true,
      downloading: false,
      downloaded: true,
      version: info.version
    }
    mainWindow.webContents.send(IPC.UPDATER_STATUS, currentStatus)
  })

  autoUpdater.on('error', (err) => {
    // Suppress 404 errors (no release published yet) and dev-mode errors
    const msg = err.message ?? ''
    const isExpected = msg.includes('404') || msg.includes('net::ERR') || msg.includes('Cannot find latest')
    currentStatus = {
      checking: false,
      available: false,
      downloading: false,
      downloaded: false,
      error: isExpected ? undefined : msg
    }
    mainWindow.webContents.send(IPC.UPDATER_STATUS, currentStatus)
  })

  // Register IPC handlers for updater
  ipcMain.handle(IPC.UPDATER_CHECK, async () => {
    await runCheck('manual')
  })

  ipcMain.handle(IPC.UPDATER_INSTALL, () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle(IPC.UPDATER_DOWNLOAD, async () => {
    await autoUpdater.downloadUpdate()
  })

  ipcMain.handle(IPC.UPDATER_STATUS, () => currentStatus)

  // Auto-detect new versions: shortly after launch, then periodically
  setTimeout(() => {
    void runCheck('startup')
  }, 10_000)
  setInterval(() => {
    void runCheck('interval')
  }, CHECK_INTERVAL_MS)
}
