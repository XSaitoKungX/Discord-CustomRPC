import { Tray, Menu, app, nativeImage, BrowserWindow } from 'electron'
import path from 'path'
import { getActiveProfile, getRpcStatus, stopRpc } from './ipc/rpc'

let tray: Tray | null = null

function getIconPath(active: boolean): string {
  const iconName = active ? 'tray-active.png' : 'tray-inactive.png'
  return app.isPackaged
    ? path.join(process.resourcesPath, 'assets', iconName)
    : path.join(__dirname, '../../assets', iconName)
}

export function createTray(mainWindow: BrowserWindow): Tray {
  const icon = nativeImage.createFromPath(getIconPath(false))
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

  tray.setImage(nativeImage.createFromPath(getIconPath(isActive)))

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
