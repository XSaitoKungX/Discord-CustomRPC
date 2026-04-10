import { create } from 'zustand'
import type { RPCProfile } from '../types/profile'

interface ProfileState {
  profiles: RPCProfile[]
  activeProfileId: string | null
  loading: boolean
  error: string | null
  setProfiles: (profiles: RPCProfile[]) => void
  addProfile: (profile: RPCProfile) => void
  updateProfile: (profile: RPCProfile) => void
  removeProfile: (id: string) => void
  setActiveProfileId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reorderProfiles: (orderedIds: string[]) => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  loading: false,
  error: null,

  setProfiles: (profiles) => set({ profiles }),

  addProfile: (profile) =>
    set((state) => ({ profiles: [...state.profiles, profile] })),

  updateProfile: (profile) =>
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === profile.id ? profile : p))
    })),

  removeProfile: (id) => {
    const { activeProfileId } = get()
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
      activeProfileId: activeProfileId === id ? null : activeProfileId
    }))
  },

  setActiveProfileId: (id) => set({ activeProfileId: id }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reorderProfiles: (orderedIds) => {
    const { profiles } = get()
    const profileMap = new Map(profiles.map((p) => [p.id, p]))
    const reordered = orderedIds.map((id) => profileMap.get(id)).filter(Boolean) as RPCProfile[]
    set({ profiles: reordered })
  }
}))
