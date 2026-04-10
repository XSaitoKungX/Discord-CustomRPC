import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, Activity, Zap, Shield } from 'lucide-react'
import { useProfiles } from '../hooks/useProfiles'
import { useRPC } from '../hooks/useRPC'
import { RPCStatus } from '../components/rpc/RPCStatus'
import { ProfileCard } from '../components/profile/ProfileCard'
import { useProfileStore } from '../store/profileStore'

export function Home(): JSX.Element {
  const { loadProfiles, deleteProfile, duplicateProfile } = useProfiles()
  const { status, activeProfileId } = useRPC()
  const { profiles } = useProfileStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const activeProfile = profiles.find((p) => p.id === activeProfileId)
  const recentProfiles = profiles.slice(0, 3)

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      {/* Status card */}
      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">RPC Status</h2>
            {activeProfile ? (
              <p className="text-sm text-muted-foreground">
                Active profile: <span className="text-foreground font-medium">{activeProfile.name}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No profile active</p>
            )}
          </div>
          <RPCStatus status={status} />
        </div>

        {!activeProfile && (
          <button
            onClick={() => navigate('/profiles')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <Zap className="w-4 h-4" />
            Activate a Profile
          </button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Activity, label: 'Total Profiles', value: profiles.length },
          { icon: Zap, label: 'Status', value: status === 'connected' ? 'Active' : 'Idle' },
          { icon: Shield, label: 'Security', value: 'No Token' }
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent profiles */}
      {recentProfiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Profiles</h2>
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

      {/* Empty state */}
      {profiles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No profiles yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first RPC profile to show a custom Discord status.</p>
          </div>
          <button
            onClick={() => navigate('/profiles')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Profile
          </button>
        </div>
      )}
    </div>
  )
}
