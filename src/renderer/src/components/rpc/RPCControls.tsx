import { Play, Square, Loader2, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useRPC } from '../../hooks/useRPC'
import { RPCStatus } from './RPCStatus'
import type { RPCProfile } from '../../types/profile'

interface RPCControlsProps {
  profile: RPCProfile
  className?: string
}

export function RPCControls({ profile, className }: RPCControlsProps): JSX.Element {
  const { status, activeProfileId, error, startRPC, stopRPC } = useRPC()

  const isThisActive = activeProfileId === profile.id
  const isConnecting = status === 'connected' && activeProfileId !== profile.id
  const loading = false

  const handleToggle = async (): Promise<void> => {
    if (isThisActive) {
      await stopRPC()
    } else {
      await startRPC(profile)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <RPCStatus
        status={isThisActive ? status : 'disconnected'}
        error={isThisActive ? error : null}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading || (!isThisActive && status === 'connected')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            isThisActive
              ? 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
            (loading || (!isThisActive && status === 'connected')) &&
              'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isThisActive ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isThisActive ? 'Deactivate' : 'Activate'}
        </button>

        {profile.showElapsedTime && isThisActive && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Elapsed time active</span>
          </div>
        )}
      </div>

      {!isThisActive && status === 'connected' && (
        <p className="text-xs text-muted-foreground">
          Another profile is active. Deactivate it first.
        </p>
      )}

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Discord allows updates every 15 seconds minimum
      </p>
    </div>
  )
}
