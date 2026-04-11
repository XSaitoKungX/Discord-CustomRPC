import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Save, X, Type, ImageIcon, MousePointerClick, Users, ExternalLink, Info, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useProfiles } from '../../hooks/useProfiles'
import { isElectron } from '../../lib/electron'
import { RPCPreview } from '../rpc/RPCPreview'
import type { RPCProfile, CreateProfileData } from '../../types/profile'

interface ProfileEditorProps {
  profile?: RPCProfile
  onSave?: (profile: RPCProfile) => void
  onCancel?: () => void
}

const emptyForm: CreateProfileData = {
  name: '',
  applicationId: '',
  details: '',
  state: '',
  largeImageKey: '',
  largeImageText: '',
  smallImageKey: '',
  smallImageText: '',
  button1Label: '',
  button1Url: '',
  button2Label: '',
  button2Url: '',
  partySize: undefined,
  partyMax: undefined,
  showElapsedTime: false
}

type Tab = 'basic' | 'images' | 'buttons' | 'extra'

const TABS: { id: Tab; label: string; icon: typeof Type }[] = [
  { id: 'basic', label: 'Basic', icon: Type },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'buttons', label: 'Buttons', icon: MousePointerClick },
  { id: 'extra', label: 'Extra', icon: Users }
]

interface FieldProps {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  hint?: string
  mono?: boolean
  error?: string
}

function Field({ label, id, value, onChange, placeholder, required, hint, mono, error }: FieldProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'px-3 py-2 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all',
          mono && 'font-mono',
          error ? 'border-red-500/70 focus:ring-red-500/30' : 'border-border'
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }): React.ReactElement {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group py-2">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors shrink-0',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </div>
    </label>
  )
}

interface AssetEntry { id: string; name: string }

function useDiscordAssets(appId: string): { assets: AssetEntry[]; loading: boolean } {
  const [assets, setAssets] = useState<AssetEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!appId || !/^\d+$/.test(appId) || !isElectron()) { setAssets([]); return }
    let cancelled = false
    setLoading(true)
    window.api.discord.getAssets(appId).then((data) => {
      if (!cancelled) setAssets(data)
    }).catch(() => {
      if (!cancelled) setAssets([])
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [appId])

  return { assets, loading }
}

interface AssetPickerProps {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  assets: AssetEntry[]
  assetsLoading: boolean
  appId: string
}

function AssetPicker({ label, id, value, onChange, assets, assetsLoading, appId }: AssetPickerProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasAppId = /^\d+$/.test(appId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = assets.filter((a) => !value || a.name.toLowerCase().includes(value.toLowerCase()))
  const selected = assets.find((a) => a.name === value)

  return (
    <div className="space-y-1" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground" htmlFor={id}>{label}</label>
      <div className="relative">
        <div className="flex gap-1">
          <input
            id={id}
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true) }}
            onFocus={() => hasAppId && setOpen(true)}
            placeholder={hasAppId ? 'Type or pick an asset…' : 'Enter Application ID first'}
            disabled={!hasAppId}
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-40"
          />
          {hasAppId && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="px-2 rounded-lg border border-border bg-background hover:bg-accent/10 transition-all"
            >
              {assetsLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          )}
        </div>

        {/* Preview thumbnail */}
        {selected && (
          <div className="absolute right-9 top-1 h-7 w-7 rounded overflow-hidden ring-1 ring-border">
            <img
              src={`https://cdn.discordapp.com/app-assets/${appId}/${selected.id}.png`}
              alt={selected.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Dropdown */}
        {open && hasAppId && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-background shadow-xl overflow-hidden">
            {assetsLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading assets…
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                {assets.length === 0 ? 'No assets found for this App ID' : 'No match'}
              </p>
            ) : (
              <ul className="max-h-48 overflow-y-auto">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors text-left"
                      onMouseDown={(e) => { e.preventDefault(); onChange(a.name); setOpen(false) }}
                    >
                      <img
                        src={`https://cdn.discordapp.com/app-assets/${appId}/${a.id}.png`}
                        alt={a.name}
                        className="w-8 h-8 rounded object-cover shrink-0 bg-muted"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                      />
                      <span className="truncate">{a.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps): React.ReactElement {
  const { createProfile, editProfile } = useProfiles()
  const [form, setForm] = useState<CreateProfileData>(
    profile ? {
      name: profile.name,
      applicationId: profile.applicationId,
      details: profile.details ?? '',
      state: profile.state ?? '',
      largeImageKey: profile.largeImageKey ?? '',
      largeImageText: profile.largeImageText ?? '',
      smallImageKey: profile.smallImageKey ?? '',
      smallImageText: profile.smallImageText ?? '',
      button1Label: profile.button1Label ?? '',
      button1Url: profile.button1Url ?? '',
      button2Label: profile.button2Label ?? '',
      button2Url: profile.button2Url ?? '',
      partySize: profile.partySize,
      partyMax: profile.partyMax,
      showElapsedTime: profile.showElapsedTime
    } : emptyForm
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<Tab>('basic')
  const { assets, loading: assetsLoading } = useDiscordAssets(form.applicationId)

  const set = useCallback((key: keyof CreateProfileData, value: string | boolean | number | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }, [errors])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Profile name is required'
    if (!form.applicationId.trim()) errs.applicationId = 'Application ID is required'
    else if (!/^\d+$/.test(form.applicationId.trim())) errs.applicationId = 'Must be a numeric ID'
    setErrors(errs)
    if (errs.name || errs.applicationId) setTab('basic')
    return Object.keys(errs).length === 0
  }

  const handleSave = async (): Promise<void> => {
    if (!validate()) return
    setSaving(true)
    try {
      const cleanForm: CreateProfileData = {
        ...form,
        details: form.details || undefined,
        state: form.state || undefined,
        largeImageKey: form.largeImageKey || undefined,
        largeImageText: form.largeImageText || undefined,
        smallImageKey: form.smallImageKey || undefined,
        smallImageText: form.smallImageText || undefined,
        button1Label: form.button1Label || undefined,
        button1Url: form.button1Url || undefined,
        button2Label: form.button2Label || undefined,
        button2Url: form.button2Url || undefined
      }
      const saved = profile
        ? await editProfile(profile.id, cleanForm)
        : await createProfile(cleanForm)
      onSave?.(saved)
    } finally {
      setSaving(false)
    }
  }

  const previewProfile = { ...form, id: profile?.id ?? 'preview', createdAt: new Date(), updatedAt: new Date() }

  return (
    <div className="flex gap-5 h-full overflow-hidden">

      {/* ── Left: Form ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-4 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {(id === 'basic' && (errors.name || errors.applicationId)) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 ml-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">

          {tab === 'basic' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
                <Field
                  label="Profile Name"
                  id="name"
                  value={form.name}
                  onChange={(v) => set('name', v)}
                  placeholder="My Gaming Profile"
                  required
                  error={errors.name}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="appId" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Application ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="appId"
                    value={form.applicationId}
                    onChange={(e) => set('applicationId', e.target.value)}
                    placeholder="123456789012345678"
                    className={cn(
                      'px-3 py-2 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all',
                      errors.applicationId ? 'border-red-500/70' : 'border-border'
                    )}
                  />
                  {errors.applicationId
                    ? <p className="text-xs text-red-400">{errors.applicationId}</p>
                    : (
                      <a
                        href="https://discord.com/developers/applications"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 w-fit"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Get it from Discord Developer Portal
                      </a>
                    )
                  }
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Activity Text</p>
                <Field
                  label="Details"
                  id="details"
                  value={form.details ?? ''}
                  onChange={(v) => set('details', v)}
                  placeholder="Playing something awesome"
                  hint="First line shown under your name"
                />
                <Field
                  label="State"
                  id="state"
                  value={form.state ?? ''}
                  onChange={(v) => set('state', v)}
                  placeholder="In a match"
                  hint="Second line shown under details"
                />
              </div>
            </div>
          )}

          {tab === 'images' && (
            <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Upload images in your <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-primary hover:underline">Discord App</a> → Rich Presence → Art Assets. Assets load automatically when App ID is set.
                </p>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Large Image</p>
                <AssetPicker
                  label="Image Key"
                  id="largeKey"
                  value={form.largeImageKey ?? ''}
                  onChange={(v) => set('largeImageKey', v)}
                  assets={assets}
                  assetsLoading={assetsLoading}
                  appId={form.applicationId}
                />
                <Field label="Tooltip" id="largeText" value={form.largeImageText ?? ''} onChange={(v) => set('largeImageText', v)} placeholder="Main game logo" />
              </div>
              <div className="border-t border-border/50 pt-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Small Image</p>
                <AssetPicker
                  label="Image Key"
                  id="smallKey"
                  value={form.smallImageKey ?? ''}
                  onChange={(v) => set('smallImageKey', v)}
                  assets={assets}
                  assetsLoading={assetsLoading}
                  appId={form.applicationId}
                />
                <Field label="Tooltip" id="smallText" value={form.smallImageText ?? ''} onChange={(v) => set('smallImageText', v)} placeholder="Online" />
              </div>
            </div>
          )}

          {tab === 'buttons' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Button 1</p>
                <Field label="Label" id="btn1label" value={form.button1Label ?? ''} onChange={(v) => set('button1Label', v)} placeholder="Visit Website" />
                <Field label="URL" id="btn1url" value={form.button1Url ?? ''} onChange={(v) => set('button1Url', v)} placeholder="https://example.com" mono />
              </div>
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Button 2</p>
                <Field label="Label" id="btn2label" value={form.button2Label ?? ''} onChange={(v) => set('button2Label', v)} placeholder="Join Server" />
                <Field label="URL" id="btn2url" value={form.button2Url ?? ''} onChange={(v) => set('button2Url', v)} placeholder="https://discord.gg/invite" mono />
              </div>
            </div>
          )}

          {tab === 'extra' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Party</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="partySize" className="text-xs font-medium text-muted-foreground">Size</label>
                    <input
                      id="partySize"
                      type="number"
                      min={1}
                      value={form.partySize ?? ''}
                      onChange={(e) => set('partySize', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="1"
                      className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="partyMax" className="text-xs font-medium text-muted-foreground">Max</label>
                    <input
                      id="partyMax"
                      type="number"
                      min={1}
                      value={form.partyMax ?? ''}
                      onChange={(e) => set('partyMax', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="4"
                      className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/30 px-4 py-2">
                <Toggle
                  label="Show Elapsed Time"
                  description="Displays a running timer in your presence"
                  checked={form.showElapsedTime}
                  onChange={(v) => set('showElapsedTime', v)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border/50 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : profile ? 'Save Changes' : 'Create Profile'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Right: Live Preview (sticky) ── */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Preview</p>
        <div className="sticky top-0 space-y-3">
          <RPCPreview profile={previewProfile} assets={assets} />

          {/* Status hint */}
          {form.applicationId && /^\d+$/.test(form.applicationId) ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Preview fetches from Discord CDN
              </p>
              {(form.largeImageKey || form.smallImageKey) && (
                <>
                  <p className="text-xs text-amber-400/80">
                    404 = Discord CDN cache delay. New assets need 5-30 min to be accessible.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    Images work in Discord client even if preview shows 404.
                  </p>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter Application ID to see images
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
