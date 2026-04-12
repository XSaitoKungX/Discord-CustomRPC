import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import type { UpdateStatus } from './types'

let currentStatus: UpdateStatus = {
  checking: false,
  available: false,
  downloading: false,
  downloaded: false
}

export function setupUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // Always allow prerelease — so beta users get beta updates
  // electron-updater compares semver, so beta.9 > beta.8 works correctly
  autoUpdater.allowPrerelease = true
  autoUpdater.channel = 'beta'
  console.log('[updater] Channel: beta, prerelease: true')

  autoUpdater.on('checking-for-update', () => {
    currentStatus = { checking: true, available: false, downloading: false, downloaded: false }
    mainWindow.webContents.send('updater:status', currentStatus)
  })

  autoUpdater.on('update-available', (info) => {
    currentStatus = {
      checking: false,
      available: true,
      downloading: false,
      downloaded: false,
      version: info.version
    }
    mainWindow.webContents.send('updater:status', currentStatus)
  })

  autoUpdater.on('update-not-available', () => {
    currentStatus = { checking: false, available: false, downloading: false, downloaded: false }
    mainWindow.webContents.send('updater:status', currentStatus)
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
    mainWindow.webContents.send('updater:status', currentStatus)
  })

  autoUpdater.on('update-downloaded', (info) => {
    currentStatus = {
      checking: false,
      available: true,
      downloading: false,
      downloaded: true,
      version: info.version
    }
    mainWindow.webContents.send('updater:status', currentStatus)
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
    mainWindow.webContents.send('updater:status', currentStatus)
  })

  // Register IPC handlers for updater
  const { ipcMain } = require('electron')

  ipcMain.handle('updater:check', async () => {
    try {
      await autoUpdater.checkForUpdates()
    } catch (err) {
      // Ignore errors in dev mode (no GitHub releases)
    }
  })

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('updater:download', async () => {
    await autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:status', () => currentStatus)
}
