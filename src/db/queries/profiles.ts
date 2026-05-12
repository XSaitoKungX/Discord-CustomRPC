import { eq, asc } from 'drizzle-orm'
import { getDatabase } from '../index'
import { profiles } from '../schema'
import type { RPCProfile } from '../../main/types'
import { ActivityType, TimestampMode } from '../../main/types'
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
      activityType: data.activityType ?? ActivityType.PLAYING,
      details: data.details ?? null,
      detailsUrl: data.detailsUrl ?? null,
      state: data.state ?? null,
      stateUrl: data.stateUrl ?? null,
      streamUrl: data.streamUrl ?? null,
      largeImageKey: data.largeImageKey ?? null,
      largeImageText: data.largeImageText ?? null,
      largeImageUrl: data.largeImageUrl ?? null,
      smallImageKey: data.smallImageKey ?? null,
      smallImageText: data.smallImageText ?? null,
      smallImageUrl: data.smallImageUrl ?? null,
      button1Label: data.button1Label ?? null,
      button1Url: data.button1Url ?? null,
      button2Label: data.button2Label ?? null,
      button2Url: data.button2Url ?? null,
      partySize: data.partySize ?? null,
      partyMax: data.partyMax ?? null,
      timestampMode: data.timestampMode ?? TimestampMode.NONE,
      startTimestamp: data.startTimestamp ?? null,
      endTimestamp: data.endTimestamp ?? null,
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
      activityType: data.activityType,
      details: data.details ?? null,
      detailsUrl: data.detailsUrl ?? null,
      state: data.state ?? null,
      stateUrl: data.stateUrl ?? null,
      streamUrl: data.streamUrl ?? null,
      largeImageKey: data.largeImageKey ?? null,
      largeImageText: data.largeImageText ?? null,
      largeImageUrl: data.largeImageUrl ?? null,
      smallImageKey: data.smallImageKey ?? null,
      smallImageText: data.smallImageText ?? null,
      smallImageUrl: data.smallImageUrl ?? null,
      button1Label: data.button1Label ?? null,
      button1Url: data.button1Url ?? null,
      button2Label: data.button2Label ?? null,
      button2Url: data.button2Url ?? null,
      partySize: data.partySize ?? null,
      partyMax: data.partyMax ?? null,
      timestampMode: data.timestampMode,
      startTimestamp: data.startTimestamp ?? null,
      endTimestamp: data.endTimestamp ?? null,
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
    activityType: (row.activityType as ActivityType) ?? ActivityType.PLAYING,
    details: row.details ?? undefined,
    detailsUrl: row.detailsUrl ?? undefined,
    state: row.state ?? undefined,
    stateUrl: row.stateUrl ?? undefined,
    streamUrl: row.streamUrl ?? undefined,
    largeImageKey: row.largeImageKey ?? undefined,
    largeImageText: row.largeImageText ?? undefined,
    largeImageUrl: row.largeImageUrl ?? undefined,
    smallImageKey: row.smallImageKey ?? undefined,
    smallImageText: row.smallImageText ?? undefined,
    smallImageUrl: row.smallImageUrl ?? undefined,
    button1Label: row.button1Label ?? undefined,
    button1Url: row.button1Url ?? undefined,
    button2Label: row.button2Label ?? undefined,
    button2Url: row.button2Url ?? undefined,
    partySize: row.partySize ?? undefined,
    partyMax: row.partyMax ?? undefined,
    timestampMode: (row.timestampMode as TimestampMode) ?? TimestampMode.NONE,
    startTimestamp: row.startTimestamp ?? undefined,
    endTimestamp: row.endTimestamp ?? undefined,
    showElapsedTime: row.showElapsedTime,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
