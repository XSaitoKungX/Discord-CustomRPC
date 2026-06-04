import { ipcMain } from 'electron'
import {
  getAllProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  reorderProfiles
} from '../../db/queries/profiles'
import type { RPCProfile } from '../types'
import { IPC } from '../../shared/ipcChannels'

export function registerProfileHandlers(): void {
  ipcMain.handle(IPC.PROFILES_GET_ALL, async () => {
    return getAllProfiles()
  })

  ipcMain.handle(
    IPC.PROFILES_CREATE,
    async (_event, data: Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      return createProfile(data)
    }
  )

  ipcMain.handle(IPC.PROFILES_UPDATE, async (_event, id: string, data: Partial<RPCProfile>) => {
    return updateProfile(id, data)
  })

  ipcMain.handle(IPC.PROFILES_DELETE, async (_event, id: string) => {
    return deleteProfile(id)
  })

  ipcMain.handle(IPC.PROFILES_REORDER, async (_event, orderedIds: string[]) => {
    return reorderProfiles(orderedIds)
  })
}
