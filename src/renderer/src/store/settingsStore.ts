import { create } from 'zustand'
import type { AppSettings, AppTheme } from '../types/rpc'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  setSettings: (settings: AppSettings) => void
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  setTheme: (theme: AppTheme) => void
  setLoaded: (loaded: boolean) => void
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

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  loaded: false,

  setSettings: (settings) => set({ settings }),

  setSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value }
    })),

  setTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme }
    })),

  setLoaded: (loaded) => set({ loaded })
}))
