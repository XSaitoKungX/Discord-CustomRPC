import { create } from 'zustand'
import type { RPCStatus, UpdateStatus } from '../types/rpc'

interface RpcState {
  status: RPCStatus
  activeProfileId: string | null
  error: string | null
  updateStatus: UpdateStatus
  setStatus: (status: RPCStatus) => void
  setActiveProfileId: (id: string | null) => void
  setError: (error: string | null) => void
  setUpdateStatus: (status: UpdateStatus) => void
}

export const useRpcStore = create<RpcState>((set) => ({
  status: 'disconnected',
  activeProfileId: null,
  error: null,
  updateStatus: {
    checking: false,
    available: false,
    downloading: false,
    downloaded: false
  },

  setStatus: (status) => set({ status }),
  setActiveProfileId: (id) => set({ activeProfileId: id }),
  setError: (error) => set({ error }),
  setUpdateStatus: (updateStatus) => set({ updateStatus })
}))
