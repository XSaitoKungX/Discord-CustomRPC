import { useCallback, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { isElectron } from '../lib/electron'
import type { AppTheme } from '../types/rpc'

export function useTheme() {
  const { settings, setSetting, setSettings, setLoaded } = useSettingsStore()

  // Load settings on mount (only in Electron context)
  useEffect(() => {
    if (!isElectron()) {
      setLoaded(true)
      return
    }
    window.api.settings.get().then((s) => {
      setSettings(s)
      setLoaded(true)
      applyTheme(s.theme)
    })
  }, [setSettings, setLoaded])

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const setTheme = useCallback(
    async (theme: AppTheme) => {
      setSetting('theme', theme)
      applyTheme(theme)
      if (isElectron()) {
        await window.api.settings.set('theme', theme)
      }
    },
    [setSetting]
  )

  return { theme: settings.theme, setTheme }
}

function applyTheme(theme: AppTheme): void {
  document.documentElement.setAttribute('data-theme', theme)
}
