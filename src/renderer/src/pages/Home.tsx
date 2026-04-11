import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, Activity, Zap, Shield, Layers, Settings, ExternalLink } from 'lucide-react'
import { useProfiles } from '../hooks/useProfiles'
import { useRPC } from '../hooks/useRPC'
import { ProfileCard } from '../components/profile/ProfileCard'
import { useProfileStore } from '../store/profileStore'
import { cn } from '../lib/utils'

const STATUS_CONFIG = {
  connected: { label: 'Connected', dot: 'bg-green-500 shadow-[0_0_8px_#22c55e]', ring: 'border-green-500/20 bg-green-500/5' },
  disconnected: { label: 'Idle', dot: 'bg-zinc-500', ring: 'border-border bg-card/30' },
  error: { label: 'Error', dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]', ring: 'border-red-500/20 bg-red-500/5' }
}

export function Home(): React.ReactElement {
  const { loadProfiles, deleteProfile, duplicateProfile } = useProfiles()
  const { status, activeProfileId } = useRPC()
  const { profiles } = useProfileStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const activeProfile = profiles.find((p) => p.id === activeProfileId)
  const recentProfiles = profiles.slice(0, 3)
  const statusCfg = STATUS_CONFIG[status]

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ── Hero Status Card ── */}
        <div className={cn(
          'relative rounded-2xl border p-6 overflow-hidden transition-colors',
          statusCfg.ring
        )}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className={cn('w-2.5 h-2.5 rounded-full animate-pulse', statusCfg.dot)} />
                <span className="text-sm font-semibold text-foreground">{statusCfg.label}</span>
              </div>
              {activeProfile ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Active Profile</p>
                  <p className="text-xl font-bold text-foreground">{activeProfile.name}</p>
                  {activeProfile.details && (
                    <p className="text-sm text-muted-foreground mt-1">{activeProfile.details}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xl font-bold text-foreground">No Active Profile</p>
                  <p className="text-sm text-muted-foreground mt-1">Select a profile to start broadcasting your status</p>
                </div>
              )}
            </div>
            {!activeProfile && (
              <button
                onClick={() => navigate('/profiles')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shrink-0"
              >
                <Zap className="w-4 h-4" />
                Activate
              </button>
            )}
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Layers,
              label: 'Profiles',
              value: profiles.length,
              sub: profiles.length === 1 ? 'profile' : 'profiles',
              onClick: () => navigate('/profiles')
            },
            {
              icon: Zap,
              label: 'Status',
              value: status === 'connected' ? 'Live' : 'Idle',
              sub: status === 'connected' ? 'Broadcasting now' : 'Not active',
              onClick: undefined
            },
            {
              icon: Shield,
              label: 'Privacy',
              value: 'Secure',
              sub: 'No token stored',
              onClick: () => navigate('/about')
            }
          ].map(({ icon: Icon, label, value, sub, onClick }) => (
            <div
              key={label}
              onClick={onClick}
              className={cn(
                'rounded-xl border border-border bg-card/30 p-4 space-y-3',
                onClick && 'cursor-pointer hover:bg-card/60 hover:border-border/80 transition-all'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Plus, label: 'New Profile', description: 'Create a custom RPC profile', onClick: () => navigate('/profiles'), primary: true },
              { icon: Settings, label: 'Settings', description: 'Adjust app preferences', onClick: () => navigate('/settings'), primary: false },
              { icon: ExternalLink, label: 'Discord Dev Portal', description: 'Manage your applications', href: 'https://discord.com/developers/applications', primary: false },
              { icon: Activity, label: 'View All Profiles', description: `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} saved`, onClick: () => navigate('/profiles'), primary: false }
            ].map(({ icon: Icon, label, description, onClick, href, primary }) => {
              const cls = cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all group',
                primary
                  ? 'bg-primary/10 border-primary/20 hover:bg-primary/15'
                  : 'bg-card/30 border-border hover:bg-card/60'
              )
              const inner = (
                <>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', primary ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-muted')}>
                    <Icon className={cn('w-4 h-4', primary ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium', primary ? 'text-primary' : 'text-foreground')}>{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>
                </>
              )
              return href ? (
                <a key={label} href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
              ) : (
                <button key={label} onClick={onClick} className={cls}>{inner}</button>
              )
            })}
          </div>
        </div>

        {/* ── Recent Profiles ── */}
        {recentProfiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Profiles</h2>
              <button
                onClick={() => navigate('/profiles')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => navigate('/profiles')}
                  onDelete={deleteProfile}
                  onDuplicate={duplicateProfile}
                  onShare={() => navigate('/profiles')}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {profiles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">No profiles yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Create your first RPC profile to broadcast a custom status on Discord.
              </p>
            </div>
            <button
              onClick={() => navigate('/profiles')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create First Profile
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
