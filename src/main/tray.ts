import { Tray, Menu, app, nativeImage, BrowserWindow } from 'electron'
import path from 'path'
import { getActiveProfile, getRpcStatus, stopRpc } from './ipc/rpc'

let tray: Tray | null = null

function getIconPath(active: boolean): string {
  const iconName = active ? 'tray-active.png' : 'tray-inactive.png'
  if (app.isPackaged) {
    // In packaged app, extraResources are at <app>/resources/assets/
    return path.join(process.resourcesPath, 'assets', iconName)
  }
  // In dev, use source directory
  return path.join(__dirname, '../../assets', iconName)
}

function getAppIconPath(): string {
  // Windows needs .ico file for proper icon display
  const iconFile = process.platform === 'win32' ? 'favicon.ico' : 'icon.png'
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', iconFile)
  }
  return path.join(__dirname, '../../assets', iconFile)
}

export function createTray(mainWindow: BrowserWindow): Tray {
  let icon = nativeImage.createFromPath(getIconPath(false))
  
  // Windows requires 16x16 tray icons
  if (process.platform === 'win32' && !icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 })
  }
  
  tray = new Tray(icon)
  tray.setToolTip('Discord Custom RPC Manager')

  updateTrayMenu(mainWindow)

  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
    }
  })

  return tray
}

export function updateTrayMenu(mainWindow: BrowserWindow): void {
  if (!tray) return

  const status = getRpcStatus()
  const activeProfile = getActiveProfile()
  const isActive = status === 'connected'

  let icon = nativeImage.createFromPath(getIconPath(isActive))
  
  // Windows requires 16x16 tray icons
  if (process.platform === 'win32' && !icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 })
  }
  
  tray.setImage(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Discord Custom RPC Manager',
      enabled: false
    },
    { type: 'separator' },
    {
      label: activeProfile ? `Active: ${activeProfile.name}` : 'No active profile',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Open App',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: 'Stop RPC',
      enabled: isActive,
      click: async () => {
        await stopRpc()
        mainWindow.webContents.send('rpc:statusChanged', 'disconnected')
        updateTrayMenu(mainWindow)
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
