import { app, BrowserWindow, shell, ipcMain, globalShortcut, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase } from '../db/index'
import { registerProfileHandlers } from './ipc/profiles'
import { registerRpcHandlers, registerDiscordApiHandlers } from './ipc/rpc'
import { initSettingsStore, registerSettingsHandlers, getSettings } from './ipc/settings'
import { createTray, updateTrayMenu, destroyTray } from './tray'
import { setupUpdater } from './updater'
import { registerDeepLinkProtocol, handleDeepLink } from './deeplink'

let mainWindow: BrowserWindow | null = null

function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

function getAppIcon(): Electron.NativeImage {
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'assets', 'icon.png')
    : join(__dirname, '../../assets/icon.png')
  return nativeImage.createFromPath(iconPath)
}

function createWindow(): void {
  const settings = getSettings()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: true,
    icon: getAppIcon(),
    backgroundColor: '#0a0a14',
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (!settings.startMinimized) {
      mainWindow?.show()
    }
  })

  mainWindow.on('close', (event) => {
    if (settings.minimizeToTray && !isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
      return
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // DevTools in dev mode
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }
}

function registerShortcuts(): void {
  globalShortcut.register('CommandOrControl+N', () => {
    mainWindow?.webContents.send('shortcut:newProfile')
  })
  globalShortcut.register('CommandOrControl+S', () => {
    mainWindow?.webContents.send('shortcut:save')
  })
  globalShortcut.register('CommandOrControl+,', () => {
    mainWindow?.webContents.send('shortcut:settings')
  })
  globalShortcut.register('CommandOrControl+W', () => {
    const settings = getSettings()
    if (settings.minimizeToTray) {
      mainWindow?.hide()
    } else {
      mainWindow?.minimize()
    }
  })
}

// Deep link handling for Windows / Linux (second instance)
app.on('second-instance', (_event, argv) => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show()
    mainWindow.focus()
  }
  const deepLinkUrl = argv.find((arg) => arg.startsWith('discordrpc://'))
  if (deepLinkUrl) {
    handleDeepLink(deepLinkUrl, mainWindow)
  }
})

// Deep link handling for macOS
app.on('open-url', (_event, url) => {
  handleDeepLink(url, mainWindow)
})

app.whenReady().then(async () => {
  // Enforce single instance
  const gotLock = app.requestSingleInstanceLock()
  if (!gotLock) {
    app.quit()
    return
  }

  electronApp.setAppUserModelId('dev.xsaitox.discord-custom-rpc')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize settings store (ESM, must await)
  await initSettingsStore()

  // Initialize DB
  try {
    initDatabase()
    console.log('[main] Database initialized')
  } catch (err) {
    console.error('[main] Failed to initialize database:', err instanceof Error ? err.stack : err)
  }

  // Register IPC
  registerProfileHandlers()
  registerRpcHandlers(getMainWindow)
  registerSettingsHandlers()
  registerDiscordApiHandlers()

  // App version IPC
  ipcMain.handle('app:version', () => app.getVersion())

  // Register deep link protocol
  registerDeepLinkProtocol()

  // Create main window
  createWindow()

  if (mainWindow) {
    // Setup tray
    const tray = createTray(mainWindow)

    // Listen for RPC status changes to update tray
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.send('app:ready')
    })

    // Update tray periodically
    setInterval(() => {
      if (mainWindow) updateTrayMenu(mainWindow)
    }, 3000)

    // Setup auto-updater
    setupUpdater(mainWindow)
  }

  registerShortcuts()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    destroyTray()
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  destroyTray()
})

// Mark app as quitting when explicitly quitting
let isQuitting = false

app.on('before-quit', () => {
  isQuitting = true
})
