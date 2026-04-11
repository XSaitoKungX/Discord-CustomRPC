import { useState } from 'react'
import { Search, Plus, Upload } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { ProfileCard } from './ProfileCard'
import type { RPCProfile } from '../../types/profile'

interface ProfileListProps {
  profiles: RPCProfile[]
  onEdit: (profile: RPCProfile) => void
  onDelete: (id: string) => void
  onDuplicate: (profile: RPCProfile) => void
  onShare: (profile: RPCProfile) => void
  onReorder: (orderedIds: string[]) => void
  onNew: () => void
  onImport: () => void
}

export function ProfileList({
  profiles,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onReorder,
  onNew,
  onImport
}: ProfileListProps): React.ReactElement {
  const [search, setSearch] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filtered = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.applicationId.includes(search) ||
      (p.details ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = profiles.findIndex((p) => p.id === active.id)
    const newIndex = profiles.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...profiles]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorder(reordered.map((p) => p.id))
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search profiles…"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={onImport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
            {search ? (
              <>
                <Search className="w-8 h-8 opacity-30" />
                <p className="text-sm">No profiles match "{search}"</p>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8 opacity-30" />
                <p className="text-sm">No profiles yet. Create one to get started.</p>
                <button
                  onClick={onNew}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  Create Profile
                </button>
              </>
            )}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {filtered.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onShare={onShare}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
        {search && ` · ${filtered.length} shown`}
      </p>
    </div>
  )
}
