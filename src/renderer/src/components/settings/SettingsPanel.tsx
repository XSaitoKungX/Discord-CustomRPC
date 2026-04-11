import { ExternalLink, RefreshCw, Download, RotateCcw, Upload, Monitor, Cpu, Database, GitBranch, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isElectron } from '../../lib/electron'
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

function Toggle({ label, description, checked, onChange }: ToggleProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, description }: { icon: typeof Monitor; title: string; description?: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

export function SettingsPanel(): React.ReactElement {
  const { settings, setSetting } = useSettingsStore()
  const { updateStatus, checkUpdates, downloadUpdate, installUpdate } = useRPC()

  const saveSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> => {
    setSetting(key, value)
    if (isElectron()) await window.api.settings.set(key, value)
  }

  const handleExportAll = async (): Promise<void> => {
    if (!isElectron()) return
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
      if (isElectron()) await window.api.settings.set(key, value)
      setSetting(key, value)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Appearance ── */}
      <section className="rounded-2xl border border-border bg-card/30 p-5 space-y-4">
        <SectionHeader icon={Monitor} title="Appearance" description="Customize the look of the app" />
        <ThemeSelector />
      </section>

      {/* ── Behavior ── */}
      <section className="rounded-2xl border border-border bg-card/30 p-5">
        <SectionHeader icon={Cpu} title="Behavior" description="Control how the app runs in the background" />
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
      </section>

      {/* ── Updates ── */}
      <section className="rounded-2xl border border-border bg-card/30 p-5 space-y-4">
        <SectionHeader icon={RefreshCw} title="Updates" description="Keep the app up to date" />

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

        {/* Update status row */}
        <div className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-3">
          <div className="flex items-center gap-2">
            {updateStatus.checking && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />}
            {!updateStatus.checking && !updateStatus.available && !updateStatus.error && (
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            )}
            {updateStatus.error && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {updateStatus.available && !updateStatus.checking && (
              <Download className="w-4 h-4 text-primary shrink-0" />
            )}
            <span className="text-xs text-muted-foreground">
              {updateStatus.checking && 'Checking for updates…'}
              {updateStatus.error && updateStatus.error}
              {!updateStatus.checking && !updateStatus.error && !updateStatus.available && "You're up to date."}
              {updateStatus.available && !updateStatus.downloaded && `v${updateStatus.version} is available`}
              {updateStatus.downloaded && `v${updateStatus.version} ready to install`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={checkUpdates}
              disabled={updateStatus.checking}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', updateStatus.checking && 'animate-spin')} />
              Check for Updates
            </button>
            {updateStatus.available && !updateStatus.downloaded && (
              <button
                onClick={downloadUpdate}
                disabled={updateStatus.downloading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {updateStatus.downloading ? 'Downloading…' : `Download v${updateStatus.version}`}
              </button>
            )}
            {updateStatus.downloaded && (
              <button
                onClick={installUpdate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/30 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Install & Restart
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Data ── */}
      <section className="rounded-2xl border border-border bg-card/30 p-5 space-y-4">
        <SectionHeader icon={Database} title="Data" description="Backup and restore your profiles" />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Profiles
          </button>
          <button
            onClick={handleImportAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Profiles
          </button>
        </div>
        <button
          onClick={handleResetSettings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 w-full text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Settings to Defaults
        </button>
      </section>

      {/* ── Links ── */}
      <section className="rounded-2xl border border-border bg-card/30 p-5 space-y-3">
        <SectionHeader icon={GitBranch} title="Resources" description="Helpful links and references" />
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { label: 'Discord Developer Portal', href: 'https://discord.com/developers/applications', description: 'Create and manage applications' },
            { label: 'GitHub Releases / Changelog', href: 'https://github.com/XSaitoKungX/Discord-CustomRPC/releases', description: 'View release history' },
            { label: 'Report an Issue', href: 'https://github.com/XSaitoKungX/Discord-CustomRPC/issues', description: 'Bug reports and feature requests' }
          ].map(({ label, href, description }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/50 bg-background/30 text-sm hover:bg-accent/10 hover:border-border transition-all group"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}
