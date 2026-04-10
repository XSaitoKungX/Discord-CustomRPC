import { useCallback } from 'react'
import { useProfileStore } from '../store/profileStore'
import { isElectron } from '../lib/electron'
import type { CreateProfileData, RPCProfile } from '../types/profile'
import toast from 'react-hot-toast'

export function useProfiles() {
  const { profiles, activeProfileId, loading, error, setProfiles, addProfile, updateProfile, removeProfile, setLoading, setError, reorderProfiles } =
    useProfileStore()

  const loadProfiles = useCallback(async () => {
    if (!isElectron()) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await window.api.profiles.getAll()
      // Convert date strings back to Date objects
      const parsed = data.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }))
      setProfiles(parsed)
      setError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load profiles'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [setProfiles, setLoading, setError])

  const createProfile = useCallback(
    async (data: CreateProfileData) => {
      setLoading(true)
      try {
        if (!isElectron()) throw new Error('Not running in Electron')
        const profile = await window.api.profiles.create(data)
        const parsed = { ...profile, createdAt: new Date(profile.createdAt), updatedAt: new Date(profile.updatedAt) }
        addProfile(parsed)
        toast.success('Profile created')
        return parsed
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create profile'
        toast.error(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addProfile, setLoading]
  )

  const editProfile = useCallback(
    async (id: string, data: Partial<RPCProfile>) => {
      try {
        if (!isElectron()) throw new Error('Not running in Electron')
        const profile = await window.api.profiles.update(id, data)
        const parsed = { ...profile, createdAt: new Date(profile.createdAt), updatedAt: new Date(profile.updatedAt) }
        updateProfile(parsed)
        toast.success('Profile saved')
        return parsed
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update profile'
        toast.error(msg)
        throw err
      }
    },
    [updateProfile]
  )

  const deleteProfile = useCallback(
    async (id: string) => {
      try {
        if (!isElectron()) throw new Error('Not running in Electron')
        await window.api.profiles.delete(id)
        removeProfile(id)
        toast.success('Profile deleted')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete profile'
        toast.error(msg)
        throw err
      }
    },
    [removeProfile]
  )

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      reorderProfiles(orderedIds)
      try {
        if (!isElectron()) return
        await window.api.profiles.reorder(orderedIds)
      } catch (err) {
        toast.error('Failed to save order')
      }
    },
    [reorderProfiles]
  )

  const duplicateProfile = useCallback(
    async (profile: RPCProfile) => {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = profile
      return createProfile({ ...rest, name: `${rest.name} (Copy)` })
    },
    [createProfile]
  )

  const exportProfiles = useCallback(
    (selectedIds?: string[]) => {
      const toExport = selectedIds
        ? profiles.filter((p) => selectedIds.includes(p.id))
        : profiles
      const json = JSON.stringify(toExport, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = selectedIds?.length === 1 ? `${toExport[0]?.name ?? 'profile'}.json` : 'profiles.json'
      a.click()
      URL.revokeObjectURL(url)
    },
    [profiles]
  )

  const importProfiles = useCallback(
    async (jsonData: string) => {
      try {
        const data = JSON.parse(jsonData)
        const toImport: CreateProfileData[] = Array.isArray(data) ? data : [data]
        const created: RPCProfile[] = []
        for (const p of toImport) {
          const profile = await createProfile({
            name: p.name ?? 'Imported Profile',
            applicationId: p.applicationId ?? '',
            details: p.details,
            state: p.state,
            largeImageKey: p.largeImageKey,
            largeImageText: p.largeImageText,
            smallImageKey: p.smallImageKey,
            smallImageText: p.smallImageText,
            button1Label: p.button1Label,
            button1Url: p.button1Url,
            button2Label: p.button2Label,
            button2Url: p.button2Url,
            partySize: p.partySize,
            partyMax: p.partyMax,
            showElapsedTime: p.showElapsedTime ?? false
          })
          created.push(profile)
        }
        toast.success(`Imported ${created.length} profile(s)`)
        return created
      } catch (err) {
        toast.error('Failed to import profiles')
        throw err
      }
    },
    [createProfile]
  )

  return {
    profiles,
    activeProfileId,
    loading,
    error,
    loadProfiles,
    createProfile,
    editProfile,
    deleteProfile,
    reorder,
    duplicateProfile,
    exportProfiles,
    importProfiles
  }
}
