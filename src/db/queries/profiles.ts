import { eq, asc } from 'drizzle-orm'
import { getDatabase } from '../index'
import { profiles } from '../schema'
import type { RPCProfile } from '../../main/types'
import { randomUUID } from 'crypto'

export async function getAllProfiles(): Promise<RPCProfile[]> {
  const db = getDatabase()
  const rows = await db.select().from(profiles).orderBy(asc(profiles.sortOrder))
  return rows.map(rowToProfile)
}

export async function createProfile(
  data: Omit<RPCProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RPCProfile> {
  const db = getDatabase()
  const now = new Date()
  const id = randomUUID()

  const allProfiles = await db.select({ sortOrder: profiles.sortOrder }).from(profiles)
  const maxOrder = allProfiles.reduce((max, p) => Math.max(max, p.sortOrder), -1)

  const [row] = await db
    .insert(profiles)
    .values({
      id,
      name: data.name,
      applicationId: data.applicationId,
      details: data.details ?? null,
      state: data.state ?? null,
      largeImageKey: data.largeImageKey ?? null,
      largeImageText: data.largeImageText ?? null,
      smallImageKey: data.smallImageKey ?? null,
      smallImageText: data.smallImageText ?? null,
      button1Label: data.button1Label ?? null,
      button1Url: data.button1Url ?? null,
      button2Label: data.button2Label ?? null,
      button2Url: data.button2Url ?? null,
      partySize: data.partySize ?? null,
      partyMax: data.partyMax ?? null,
      showElapsedTime: data.showElapsedTime,
      sortOrder: maxOrder + 1,
      createdAt: now,
      updatedAt: now
    })
    .returning()

  return rowToProfile(row)
}

export async function updateProfile(id: string, data: Partial<RPCProfile>): Promise<RPCProfile> {
  const db = getDatabase()
  const now = new Date()

  const [row] = await db
    .update(profiles)
    .set({
      name: data.name,
      applicationId: data.applicationId,
      details: data.details ?? null,
      state: data.state ?? null,
      largeImageKey: data.largeImageKey ?? null,
      largeImageText: data.largeImageText ?? null,
      smallImageKey: data.smallImageKey ?? null,
      smallImageText: data.smallImageText ?? null,
      button1Label: data.button1Label ?? null,
      button1Url: data.button1Url ?? null,
      button2Label: data.button2Label ?? null,
      button2Url: data.button2Url ?? null,
      partySize: data.partySize ?? null,
      partyMax: data.partyMax ?? null,
      showElapsedTime: data.showElapsedTime,
      updatedAt: now
    })
    .where(eq(profiles.id, id))
    .returning()

  return rowToProfile(row)
}

export async function deleteProfile(id: string): Promise<void> {
  const db = getDatabase()
  await db.delete(profiles).where(eq(profiles.id, id))
}

export async function reorderProfiles(orderedIds: string[]): Promise<void> {
  const db = getDatabase()
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(profiles)
      .set({ sortOrder: i })
      .where(eq(profiles.id, orderedIds[i]))
  }
}

function rowToProfile(row: typeof profiles.$inferSelect): RPCProfile {
  return {
    id: row.id,
    name: row.name,
    applicationId: row.applicationId,
    details: row.details ?? undefined,
    state: row.state ?? undefined,
    largeImageKey: row.largeImageKey ?? undefined,
    largeImageText: row.largeImageText ?? undefined,
    smallImageKey: row.smallImageKey ?? undefined,
    smallImageText: row.smallImageText ?? undefined,
    button1Label: row.button1Label ?? undefined,
    button1Url: row.button1Url ?? undefined,
    button2Label: row.button2Label ?? undefined,
    button2Url: row.button2Url ?? undefined,
    partySize: row.partySize ?? undefined,
    partyMax: row.partyMax ?? undefined,
    showElapsedTime: row.showElapsedTime,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
