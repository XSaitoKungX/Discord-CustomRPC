import { app, BrowserWindow } from 'electron'

const PROTOCOL = 'discordrpc'

export function registerDeepLinkProtocol(): void {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]])
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL)
  }
}

export function handleDeepLink(url: string, mainWindow: BrowserWindow | null): void {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== `${PROTOCOL}:`) return

    const action = parsed.hostname
    const data = parsed.searchParams.get('data')

    if (!mainWindow) return

    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    mainWindow.focus()

    if (action === 'import' && data) {
      mainWindow.webContents.send('deeplink:import', data)
    }
  } catch {
    // Ignore invalid URLs
  }
}
