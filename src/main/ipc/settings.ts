import { ipcMain, app } from 'electron'
import type { AppSettings } from '../types'

// electron-store v11 is ESM-only; use a type-only import for the class shape
type ElectronStore<T extends Record<string, unknown>> = {
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K]
  set<K extends keyof T>(key: K, value: T[K]): void
}

const defaultSettings: AppSettings = {
  theme: 'default',
  language: 'en',
  minimizeToTray: true,
  startMinimized: false,
  autostart: false,
  updateChannel: 'stable',
  showOnboarding: true
}

let store: ElectronStore<AppSettings> | null = null

export async function initSettingsStore(): Promise<void> {
  const { default: Store } = await import('electron-store')
  store = new Store<AppSettings>({
    name: 'settings',
    defaults: defaultSettings
  }) as ElectronStore<AppSettings>
}

function getStore(): ElectronStore<AppSettings> {
  if (!store) throw new Error('Settings store not initialized')
  return store
}

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', (): AppSettings => {
    const s = getStore()
    return {
      theme: s.get('theme', defaultSettings.theme),
      language: s.get('language', defaultSettings.language),
      minimizeToTray: s.get('minimizeToTray', defaultSettings.minimizeToTray),
      startMinimized: s.get('startMinimized', defaultSettings.startMinimized),
      autostart: s.get('autostart', defaultSettings.autostart),
      updateChannel: s.get('updateChannel', defaultSettings.updateChannel),
      showOnboarding: s.get('showOnboarding', defaultSettings.showOnboarding)
    }
  })

  ipcMain.handle(
    'settings:set',
    (_event, key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
      const s = getStore()
      s.set(key, value)

      // Handle autostart
      if (key === 'autostart') {
        app.setLoginItemSettings({
          openAtLogin: value as boolean,
          openAsHidden: s.get('startMinimized', false)
        })
      }
    }
  )
}

export function getSettings(): AppSettings {
  const s = getStore()
  return {
    theme: s.get('theme', defaultSettings.theme),
    language: s.get('language', defaultSettings.language),
    minimizeToTray: s.get('minimizeToTray', defaultSettings.minimizeToTray),
    startMinimized: s.get('startMinimized', defaultSettings.startMinimized),
    autostart: s.get('autostart', defaultSettings.autostart),
    updateChannel: s.get('updateChannel', defaultSettings.updateChannel),
    showOnboarding: s.get('showOnboarding', defaultSettings.showOnboarding)
  }
}
