import { useState, useEffect, useCallback } from 'react'
import { Save, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useProfiles } from '../../hooks/useProfiles'
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

interface FieldProps {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  hint?: string
}

function Field({ label, id, value, onChange, placeholder, required, hint }: FieldProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps): JSX.Element {
  const { createProfile, editProfile } = useProfiles()
  const [form, setForm] = useState<CreateProfileData>(
    profile
      ? {
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
        }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = useCallback((key: keyof CreateProfileData, value: string | boolean | number | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.applicationId.trim()) errs.applicationId = 'Application ID is required'
    if (form.applicationId && !/^\d+$/.test(form.applicationId.trim())) {
      errs.applicationId = 'Must be a numeric Discord Application ID'
    }
    setErrors(errs)
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
      let saved: RPCProfile
      if (profile) {
        saved = await editProfile(profile.id, cleanForm)
      } else {
        saved = await createProfile(cleanForm)
      }
      onSave?.(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Form */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-5">
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Basic Info</h3>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Profile Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="My Gaming Profile"
                className={cn(
                  'px-3 py-2 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
                  errors.name ? 'border-red-500' : 'border-border'
                )}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="appId" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Application ID <span className="text-red-400">*</span>
              </label>
              <input
                id="appId"
                value={form.applicationId}
                onChange={(e) => set('applicationId', e.target.value)}
                placeholder="123456789012345678"
                className={cn(
                  'px-3 py-2 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono',
                  errors.applicationId ? 'border-red-500' : 'border-border'
                )}
              />
              {errors.applicationId && <p className="text-xs text-red-400">{errors.applicationId}</p>}
              <p className="text-xs text-muted-foreground">
                Get it from{' '}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Discord Developer Portal
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Activity Text</h3>
          <Field label="Details" id="details" value={form.details ?? ''} onChange={(v) => set('details', v)} placeholder="Playing something awesome" />
          <Field label="State" id="state" value={form.state ?? ''} onChange={(v) => set('state', v)} placeholder="In a match" />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Images</h3>
          <Field label="Large Image Key" id="largeKey" value={form.largeImageKey ?? ''} onChange={(v) => set('largeImageKey', v)} placeholder="game_logo" hint="Asset name from Discord Developer Portal" />
          <Field label="Large Image Tooltip" id="largeText" value={form.largeImageText ?? ''} onChange={(v) => set('largeImageText', v)} placeholder="Main game logo" />
          <Field label="Small Image Key" id="smallKey" value={form.smallImageKey ?? ''} onChange={(v) => set('smallImageKey', v)} placeholder="status_icon" />
          <Field label="Small Image Tooltip" id="smallText" value={form.smallImageText ?? ''} onChange={(v) => set('smallImageText', v)} placeholder="Online" />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Buttons</h3>
          <Field label="Button 1 Label" id="btn1label" value={form.button1Label ?? ''} onChange={(v) => set('button1Label', v)} placeholder="Visit Website" />
          <Field label="Button 1 URL" id="btn1url" value={form.button1Url ?? ''} onChange={(v) => set('button1Url', v)} placeholder="https://example.com" />
          <Field label="Button 2 Label" id="btn2label" value={form.button2Label ?? ''} onChange={(v) => set('button2Label', v)} placeholder="Join Server" />
          <Field label="Button 2 URL" id="btn2url" value={form.button2Url ?? ''} onChange={(v) => set('button2Url', v)} placeholder="https://discord.gg/invite" />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Party & Time</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="partySize" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Party Size</label>
              <input
                id="partySize"
                type="number"
                min={1}
                value={form.partySize ?? ''}
                onChange={(e) => set('partySize', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1"
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="partyMax" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Party Max</label>
              <input
                id="partyMax"
                type="number"
                min={1}
                value={form.partyMax ?? ''}
                onChange={(e) => set('partyMax', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="4"
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.showElapsedTime}
                onChange={(e) => set('showElapsedTime', e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                'w-10 h-5.5 rounded-full transition-colors',
                form.showElapsedTime ? 'bg-primary' : 'bg-muted'
              )}>
                <div className={cn(
                  'w-4 h-4 bg-white rounded-full mt-[3px] transition-transform shadow-sm',
                  form.showElapsedTime ? 'translate-x-5 ml-1' : 'translate-x-1'
                )} />
              </div>
            </div>
            <span className="text-sm text-foreground">Show elapsed time</span>
          </label>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
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

      {/* Live Preview */}
      <div className="w-72 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Live Preview</p>
        <RPCPreview profile={{ ...form, id: profile?.id ?? 'preview', createdAt: new Date(), updatedAt: new Date() }} />
      </div>
    </div>
  )
}
