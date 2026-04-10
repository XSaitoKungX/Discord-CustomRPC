import { useCallback, useEffect } from 'react'
import { useRpcStore } from '../store/rpcStore'
import { isElectron } from '../lib/electron'
import type { RPCProfile } from '../types/profile'
import toast from 'react-hot-toast'

export function useRPC() {
  const { status, activeProfileId, error, updateStatus, setStatus, setActiveProfileId, setError, setUpdateStatus } =
    useRpcStore()

  // Subscribe to RPC status changes from main process
  useEffect(() => {
    if (!isElectron()) return
    const unsubscribe = window.api.rpc.onStatusChanged((newStatus) => {
      setStatus(newStatus)
      if (newStatus === 'error') {
        toast.error('RPC connection lost')
      }
    })
    return unsubscribe
  }, [setStatus])

  // Subscribe to updater status
  useEffect(() => {
    if (!isElectron()) return
    const unsubscribe = window.api.updater.onStatus((status) => {
      setUpdateStatus(status)
      if (status.downloaded) {
        toast.success(`Update v${status.version} ready to install!`, { duration: 10000 })
      }
    })
    return unsubscribe
  }, [setUpdateStatus])

  const startRPC = useCallback(
    async (profile: RPCProfile) => {
      if (!isElectron()) return { success: false, error: 'Not running in Electron' }
      try {
        const result = await window.api.rpc.start(profile)
        if (result.success) {
          setActiveProfileId(profile.id)
          setError(null)
          toast.success(`RPC activated: ${profile.name}`)
        } else {
          setError(result.error ?? 'Unknown error')
          toast.error(result.error ?? 'Failed to start RPC')
        }
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to start RPC'
        setError(msg)
        toast.error(msg)
        return { success: false, error: msg }
      }
    },
    [setActiveProfileId, setError]
  )

  const stopRPC = useCallback(async () => {
    if (!isElectron()) return
    try {
      await window.api.rpc.stop()
      setActiveProfileId(null)
      setError(null)
      toast.success('RPC deactivated')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to stop RPC'
      toast.error(msg)
    }
  }, [setActiveProfileId, setError])

  const checkUpdates = useCallback(async () => {
    if (!isElectron()) return
    await window.api.updater.check()
  }, [])

  const installUpdate = useCallback(async () => {
    if (!isElectron()) return
    await window.api.updater.install()
  }, [])

  const downloadUpdate = useCallback(async () => {
    if (!isElectron()) return
    await window.api.updater.download()
  }, [])

  return {
    status,
    activeProfileId,
    error,
    updateStatus,
    startRPC,
    stopRPC,
    checkUpdates,
    installUpdate,
    downloadUpdate
  }
}
