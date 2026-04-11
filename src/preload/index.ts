import { contextBridge, ipcRenderer } from 'electron'
import type { RPCProfile, AppSettings } from '../main/types'

// Expose a typed API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Profiles
  profiles: {
    getAll: (): Promise<RPCProfile[]> => ipcRenderer.invoke('profiles:getAll'),
    create: (
      data: Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<RPCProfile> => ipcRenderer.invoke('profiles:create', data),
    update: (id: string, data: Partial<RPCProfile>): Promise<RPCProfile> =>
      ipcRenderer.invoke('profiles:update', id, data),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('profiles:delete', id),
    reorder: (orderedIds: string[]): Promise<void> =>
      ipcRenderer.invoke('profiles:reorder', orderedIds)
  },

  // RPC
  rpc: {
    start: (profile: RPCProfile): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('rpc:start', profile),
    stop: (): Promise<void> => ipcRenderer.invoke('rpc:stop'),
    status: (): Promise<'connected' | 'disconnected' | 'error'> =>
      ipcRenderer.invoke('rpc:status'),
    onStatusChanged: (
      callback: (status: 'connected' | 'disconnected' | 'error') => void
    ): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: 'connected' | 'disconnected' | 'error') =>
        callback(status)
      ipcRenderer.on('rpc:statusChanged', handler)
      return () => ipcRenderer.removeListener('rpc:statusChanged', handler)
    }
  },

  // Settings
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> =>
      ipcRenderer.invoke('settings:set', key, value)
  },

  // Updater
  updater: {
    check: (): Promise<void> => ipcRenderer.invoke('updater:check'),
    install: (): Promise<void> => ipcRenderer.invoke('updater:install'),
    download: (): Promise<void> => ipcRenderer.invoke('updater:download'),
    status: (): Promise<import('../main/types').UpdateStatus> =>
      ipcRenderer.invoke('updater:status'),
    onStatus: (
      callback: (status: import('../main/types').UpdateStatus) => void
    ): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        status: import('../main/types').UpdateStatus
      ) => callback(status)
      ipcRenderer.on('updater:status', handler)
      return () => ipcRenderer.removeListener('updater:status', handler)
    }
  },

  // App
  app: {
    version: (): Promise<string> => ipcRenderer.invoke('app:version'),
    onReady: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on('app:ready', handler)
      return () => ipcRenderer.removeListener('app:ready', handler)
    }
  },

  // Discord API helpers (no auth required for public app assets)
  discord: {
    getAssets: (appId: string): Promise<Array<{ id: string; name: string }>> =>
      ipcRenderer.invoke('discord:getAssets', appId)
  },

  // Deep links
  deeplink: {
    onImport: (callback: (data: string) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: string) => callback(data)
      ipcRenderer.on('deeplink:import', handler)
      return () => ipcRenderer.removeListener('deeplink:import', handler)
    }
  },

  // Shortcuts
  shortcuts: {
    onNewProfile: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on('shortcut:newProfile', handler)
      return () => ipcRenderer.removeListener('shortcut:newProfile', handler)
    },
    onSave: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on('shortcut:save', handler)
      return () => ipcRenderer.removeListener('shortcut:save', handler)
    },
    onSettings: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on('shortcut:settings', handler)
      return () => ipcRenderer.removeListener('shortcut:settings', handler)
    }
  }
})
