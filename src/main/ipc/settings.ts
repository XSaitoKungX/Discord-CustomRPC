import { ipcMain, app } from 'electron'
import type { AppSettings } from '../types'
import { IPC } from '../../shared/ipcChannels'

// electron-store v11 is ESM-only; use a type-only import for the class shape
type ElectronStore<T extends Record<string, unknown>> = {
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K]
  set<K extends keyof T>(key: K, value: T[K]): void
}

const defaultSettings: AppSettings = {
  theme: 'default',
  minimizeToTray: true,
  startMinimized: false,
  autostart: false,
  updateChannel: 'stable',
  showOnboarding: true,
  lastActiveProfileId: null
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
  ipcMain.handle(IPC.SETTINGS_GET, (): AppSettings => {
    const s = getStore()
    return {
      theme: s.get('theme', defaultSettings.theme),
      minimizeToTray: s.get('minimizeToTray', defaultSettings.minimizeToTray),
      startMinimized: s.get('startMinimized', defaultSettings.startMinimized),
      autostart: s.get('autostart', defaultSettings.autostart),
      updateChannel: s.get('updateChannel', defaultSettings.updateChannel),
      showOnboarding: s.get('showOnboarding', defaultSettings.showOnboarding),
      lastActiveProfileId: s.get('lastActiveProfileId', defaultSettings.lastActiveProfileId)
    }
  })

  ipcMain.handle(
    IPC.SETTINGS_SET,
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
    minimizeToTray: s.get('minimizeToTray', defaultSettings.minimizeToTray),
    startMinimized: s.get('startMinimized', defaultSettings.startMinimized),
    autostart: s.get('autostart', defaultSettings.autostart),
    updateChannel: s.get('updateChannel', defaultSettings.updateChannel),
    showOnboarding: s.get('showOnboarding', defaultSettings.showOnboarding),
    lastActiveProfileId: s.get('lastActiveProfileId', defaultSettings.lastActiveProfileId)
  }
}

export function saveLastActiveProfileId(id: string | null): void {
  try {
    getStore().set('lastActiveProfileId', id)
  } catch {
    // Store not ready — ignore
  }
}
