import { Edit2, Trash2, Play, Square, Copy, Share2, GripVertical } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useRPC } from '../../hooks/useRPC'
import type { RPCProfile } from '../../types/profile'
import { format } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProfileCardProps {
  profile: RPCProfile
  onEdit: (profile: RPCProfile) => void
  onDelete: (id: string) => void
  onDuplicate: (profile: RPCProfile) => void
  onShare: (profile: RPCProfile) => void
}

export function ProfileCard({ profile, onEdit, onDelete, onDuplicate, onShare }: ProfileCardProps): React.ReactElement {
  const { status, activeProfileId, startRPC, stopRPC } = useRPC()
  const isActive = activeProfileId === profile.id
  const canActivate = status === 'disconnected' || isActive

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: profile.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleToggle = async (): Promise<void> => {
    if (isActive) {
      await stopRPC()
    } else {
      await startRPC(profile)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-3 p-4 rounded-xl border transition-all',
        'bg-card/50 backdrop-blur-sm hover:bg-card/80',
        isActive
          ? 'border-primary/40 shadow-[0_0_20px_rgba(88,101,242,0.15)]'
          : 'border-border hover:border-border/80',
        isDragging && 'opacity-50 z-50 shadow-2xl'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 p-1 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Status indicator */}
      <div
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          isActive && status === 'connected' && 'bg-green-500 shadow-[0_0_6px_#22c55e]',
          isActive && status === 'error' && 'bg-red-500',
          !isActive && 'bg-zinc-600'
        )}
      />

      {/* Profile info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
          {isActive && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary">
              ACTIVE
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate font-mono">{profile.applicationId}</p>
        {profile.details && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.details}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onShare(profile)}
          title="Share"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDuplicate(profile)}
          title="Duplicate"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(profile)}
          title="Edit"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(profile.id)}
          title="Delete"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Activate/Deactivate button */}
      <button
        onClick={handleToggle}
        disabled={!canActivate}
        title={isActive ? 'Deactivate' : 'Activate'}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          isActive
            ? 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'
            : 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25',
          !canActivate && 'opacity-40 cursor-not-allowed'
        )}
      >
        {isActive ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        {isActive ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
