import { contextBridge, ipcRenderer } from 'electron'
import type { RPCProfile, AppSettings } from '../main/types'
import { IPC } from '../shared/ipcChannels'

// Expose a typed API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Profiles
  profiles: {
    getAll: (): Promise<RPCProfile[]> => ipcRenderer.invoke(IPC.PROFILES_GET_ALL),
    create: (
      data: Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<RPCProfile> => ipcRenderer.invoke(IPC.PROFILES_CREATE, data),
    update: (id: string, data: Partial<RPCProfile>): Promise<RPCProfile> =>
      ipcRenderer.invoke(IPC.PROFILES_UPDATE, id, data),
    delete: (id: string): Promise<void> => ipcRenderer.invoke(IPC.PROFILES_DELETE, id),
    reorder: (orderedIds: string[]): Promise<void> =>
      ipcRenderer.invoke(IPC.PROFILES_REORDER, orderedIds)
  },

  // RPC
  rpc: {
    start: (profile: RPCProfile): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC.RPC_START, profile),
    stop: (): Promise<void> => ipcRenderer.invoke(IPC.RPC_STOP),
    status: (): Promise<'connected' | 'disconnected' | 'error'> =>
      ipcRenderer.invoke(IPC.RPC_STATUS),
    onStatusChanged: (
      callback: (status: 'connected' | 'disconnected' | 'error') => void
    ): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: 'connected' | 'disconnected' | 'error') =>
        callback(status)
      ipcRenderer.on(IPC.RPC_STATUS_CHANGED, handler)
      return () => ipcRenderer.removeListener(IPC.RPC_STATUS_CHANGED, handler)
    },
    onAutoStarted: (callback: (profileId: string) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, profileId: string) => callback(profileId)
      ipcRenderer.on(IPC.RPC_AUTO_STARTED, handler)
      return () => ipcRenderer.removeListener(IPC.RPC_AUTO_STARTED, handler)
    }
  },

  // Settings
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
    set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET, key, value)
  },

  // Updater
  updater: {
    check: (): Promise<void> => ipcRenderer.invoke(IPC.UPDATER_CHECK),
    install: (): Promise<void> => ipcRenderer.invoke(IPC.UPDATER_INSTALL),
    download: (): Promise<void> => ipcRenderer.invoke(IPC.UPDATER_DOWNLOAD),
    status: (): Promise<import('../main/types').UpdateStatus> =>
      ipcRenderer.invoke(IPC.UPDATER_STATUS),
    onStatus: (
      callback: (status: import('../main/types').UpdateStatus) => void
    ): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        status: import('../main/types').UpdateStatus
      ) => callback(status)
      ipcRenderer.on(IPC.UPDATER_STATUS, handler)
      return () => ipcRenderer.removeListener(IPC.UPDATER_STATUS, handler)
    }
  },

  // App
  app: {
    version: (): Promise<string> => ipcRenderer.invoke(IPC.APP_VERSION),
    onReady: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on(IPC.APP_READY, handler)
      return () => ipcRenderer.removeListener(IPC.APP_READY, handler)
    }
  },

  // Discord API helpers (no auth required for public app assets)
  discord: {
    getAssets: (appId: string): Promise<Array<{ id: string; name: string }>> =>
      ipcRenderer.invoke(IPC.DISCORD_GET_ASSETS, appId)
  },

  // Deep links
  deeplink: {
    onImport: (callback: (data: string) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: string) => callback(data)
      ipcRenderer.on(IPC.DEEPLINK_IMPORT, handler)
      return () => ipcRenderer.removeListener(IPC.DEEPLINK_IMPORT, handler)
    }
  },

  // Shortcuts
  shortcuts: {
    onNewProfile: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on(IPC.SHORTCUT_NEW_PROFILE, handler)
      return () => ipcRenderer.removeListener(IPC.SHORTCUT_NEW_PROFILE, handler)
    },
    onSave: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on(IPC.SHORTCUT_SAVE, handler)
      return () => ipcRenderer.removeListener(IPC.SHORTCUT_SAVE, handler)
    },
    onSettings: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on(IPC.SHORTCUT_SETTINGS, handler)
      return () => ipcRenderer.removeListener(IPC.SHORTCUT_SETTINGS, handler)
    }
  }
})
