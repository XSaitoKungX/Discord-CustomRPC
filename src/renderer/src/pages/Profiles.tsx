import { useEffect, useState, useCallback } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { ProfileList } from '../components/profile/ProfileList'
import { ProfileEditor } from '../components/profile/ProfileEditor'
import { ProfileShare } from '../components/profile/ProfileShare'
import { useProfileStore } from '../store/profileStore'
import type { RPCProfile } from '../types/profile'
import { ArrowLeft } from 'lucide-react'
import { decodeShareData } from '../lib/utils'
import { isElectron } from '../lib/electron'

type View = 'list' | 'new' | 'edit'

export function Profiles(): React.ReactElement {
  const { loadProfiles, deleteProfile, duplicateProfile, reorder, importProfiles } = useProfiles()
  const { profiles } = useProfileStore()
  const [view, setView] = useState<View>('list')
  const [editingProfile, setEditingProfile] = useState<RPCProfile | undefined>()
  const [sharingProfile, setSharingProfile] = useState<RPCProfile | undefined>()

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  // Deep link import listener
  useEffect(() => {
    if (!isElectron()) return
    const handleDeeplinkImport = (data: string): void => {
      const profile = decodeShareData(data)
      if (profile) importProfiles(JSON.stringify(profile))
    }
    const unsubscribe = window.api.deeplink.onImport(handleDeeplinkImport)
    return unsubscribe
  }, [importProfiles])

  // Settings panel import listener
  useEffect(() => {
    const handler = (e: Event): void => {
      const text = (e as CustomEvent<string>).detail
      importProfiles(text)
    }
    window.addEventListener('import-profiles', handler)
    return () => window.removeEventListener('import-profiles', handler)
  }, [importProfiles])

  const handleEdit = useCallback((profile: RPCProfile): void => {
    setEditingProfile(profile)
    setView('edit')
  }, [])

  const handleSaved = useCallback((): void => {
    setView('list')
    setEditingProfile(undefined)
  }, [])

  const handleNew = useCallback((): void => {
    setEditingProfile(undefined)
    setView('new')
  }, [])

  const handleImport = useCallback((): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      await importProfiles(text)
    }
    input.click()
  }, [importProfiles])

  if (view === 'list') {
    return (
      <div className="p-6 h-full flex flex-col">
        {sharingProfile && (
          <ProfileShare profile={sharingProfile} onClose={() => setSharingProfile(undefined)} />
        )}
        <ProfileList
          profiles={profiles}
          onEdit={handleEdit}
          onDelete={deleteProfile}
          onDuplicate={duplicateProfile}
          onShare={setSharingProfile}
          onReorder={reorder}
          onNew={handleNew}
          onImport={handleImport}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Profiles
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-xs font-medium text-foreground">
          {view === 'new' ? 'New Profile' : editingProfile?.name}
        </span>
      </div>
      {/* Editor */}
      <div className="flex-1 overflow-hidden p-6">
        <ProfileEditor
          profile={editingProfile}
          onSave={handleSaved}
          onCancel={() => setView('list')}
        />
      </div>
    </div>
  )
}
