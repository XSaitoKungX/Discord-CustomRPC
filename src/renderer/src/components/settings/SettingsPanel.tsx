import { ExternalLink, RefreshCw, Download, RotateCcw, Upload } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useSettingsStore } from '../../store/settingsStore'
import { useRPC } from '../../hooks/useRPC'
import { ThemeSelector } from './ThemeSelector'
import type { AppSettings } from '../../types/rpc'

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ label, description, checked, onChange }: ToggleProps): JSX.Element {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </div>
    </label>
  )
}

export function SettingsPanel(): JSX.Element {
  const { settings, setSetting } = useSettingsStore()
  const { updateStatus, checkUpdates, downloadUpdate, installUpdate } = useRPC()

  const saveSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> => {
    setSetting(key, value)
    await window.api.settings.set(key, value)
  }

  const handleExportAll = async (): Promise<void> => {
    const profiles = await window.api.profiles.getAll()
    const json = JSON.stringify(profiles, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'discord-rpc-profiles-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportAll = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      // Import handled via profiles hook in parent
      window.dispatchEvent(new CustomEvent('import-profiles', { detail: text }))
    }
    input.click()
  }

  const handleResetSettings = async (): Promise<void> => {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return
    const defaults: AppSettings = {
      theme: 'default',
      language: 'en',
      minimizeToTray: true,
      startMinimized: false,
      autostart: false,
      updateChannel: 'stable',
      showOnboarding: true
    }
    for (const [key, value] of Object.entries(defaults) as [keyof AppSettings, AppSettings[keyof AppSettings]][]) {
      await window.api.settings.set(key, value)
      setSetting(key, value)
    }
  }

  return (
    <div className="space-y-8">
      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Appearance</h2>
        <ThemeSelector />
      </section>

      {/* Behavior */}
      <section className="space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Behavior</h2>
        <div className="rounded-xl border border-border bg-card/30 px-4">
          <Toggle
            label="Minimize to Tray"
            description="Hide to system tray instead of closing"
            checked={settings.minimizeToTray}
            onChange={(v) => saveSetting('minimizeToTray', v)}
          />
          <Toggle
            label="Start Minimized"
            description="Launch the app in the background"
            checked={settings.startMinimized}
            onChange={(v) => saveSetting('startMinimized', v)}
          />
          <Toggle
            label="Launch at Startup"
            description="Start automatically when you log in"
            checked={settings.autostart}
            onChange={(v) => saveSetting('autostart', v)}
          />
          <Toggle
            label="Show Onboarding on Start"
            description="Display the welcome guide when opening the app"
            checked={settings.showOnboarding}
            onChange={(v) => saveSetting('showOnboarding', v)}
          />
        </div>
      </section>

      {/* Updates */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Updates</h2>
        <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Update Channel</p>
              <p className="text-xs text-muted-foreground mt-0.5">Choose between stable and beta builds</p>
            </div>
            <select
              value={settings.updateChannel}
              onChange={(e) => saveSetting('updateChannel', e.target.value as 'stable' | 'beta')}
              className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkUpdates}
              disabled={updateStatus.checking}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', updateStatus.checking && 'animate-spin')} />
              {updateStatus.checking ? 'Checking…' : 'Check for Updates'}
            </button>

            {updateStatus.available && !updateStatus.downloaded && (
              <button
                onClick={downloadUpdate}
                disabled={updateStatus.downloading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {updateStatus.downloading ? 'Downloading…' : `Download v${updateStatus.version}`}
              </button>
            )}

            {updateStatus.downloaded && (
              <button
                onClick={installUpdate}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/20 text-sm font-medium hover:bg-green-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Install & Restart
              </button>
            )}
          </div>

          {updateStatus.error && (
            <p className="text-xs text-red-400">{updateStatus.error}</p>
          )}
          {!updateStatus.available && !updateStatus.checking && !updateStatus.error && (
            <p className="text-xs text-muted-foreground">You're up to date.</p>
          )}
        </div>
      </section>

      {/* Data */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <Download className="w-4 h-4" />
            Export All Profiles
          </button>
          <button
            onClick={handleImportAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Profiles
          </button>
          <button
            onClick={handleResetSettings}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Settings
          </button>
        </div>
      </section>

      {/* Links */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Links</h2>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Discord Developer Portal
          </a>
          <a
            href="https://github.com/XSaitoKungX/Discord-CustomRPC/releases"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Changelog
          </a>
        </div>
      </section>
    </div>
  )
}
