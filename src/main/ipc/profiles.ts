import { ipcMain } from 'electron'
import {
  getAllProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  reorderProfiles
} from '../../db/queries/profiles'
import type { RPCProfile } from '../types'

export function registerProfileHandlers(): void {
  ipcMain.handle('profiles:getAll', async () => {
    return getAllProfiles()
  })

  ipcMain.handle(
    'profiles:create',
    async (_event, data: Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      return createProfile(data)
    }
  )

  ipcMain.handle('profiles:update', async (_event, id: string, data: Partial<RPCProfile>) => {
    return updateProfile(id, data)
  })

  ipcMain.handle('profiles:delete', async (_event, id: string) => {
    return deleteProfile(id)
  })

  ipcMain.handle('profiles:reorder', async (_event, orderedIds: string[]) => {
    return reorderProfiles(orderedIds)
  })
}
