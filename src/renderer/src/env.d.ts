/// <reference types="vite/client" />

import type { RPCProfile, AppSettings, UpdateStatus } from './types/rpc'

declare global {
  interface Window {
    api: {
      profiles: {
        getAll: () => Promise<RPCProfile[]>
        create: (data: Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RPCProfile>
        update: (id: string, data: Partial<RPCProfile>) => Promise<RPCProfile>
        delete: (id: string) => Promise<void>
        reorder: (orderedIds: string[]) => Promise<void>
      }
      rpc: {
        start: (profile: RPCProfile) => Promise<{ success: boolean; error?: string }>
        stop: () => Promise<void>
        status: () => Promise<'connected' | 'disconnected' | 'error'>
        onStatusChanged: (
          callback: (status: 'connected' | 'disconnected' | 'error') => void
        ) => () => void
      }
      settings: {
        get: () => Promise<AppSettings>
        set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
      }
      updater: {
        check: () => Promise<void>
        install: () => Promise<void>
        download: () => Promise<void>
        status: () => Promise<UpdateStatus>
        onStatus: (callback: (status: UpdateStatus) => void) => () => void
      }
      app: {
        version: () => Promise<string>
        onReady: (callback: () => void) => () => void
      }
      deeplink: {
        onImport: (callback: (data: string) => void) => () => void
      }
      shortcuts: {
        onNewProfile: (callback: () => void) => () => void
        onSave: (callback: () => void) => () => void
        onSettings: (callback: () => void) => () => void
      }
    }
  }
}
