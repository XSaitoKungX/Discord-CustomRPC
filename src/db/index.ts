import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import * as schema from './schema'

let db: ReturnType<typeof drizzle<typeof schema>>

export function initDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  const userDataPath = app.getPath('userData')
  const dbDir = path.join(userDataPath, 'data')
  const dbPath = path.join(dbDir, 'app.db')

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite, { schema })

  // Run migrations — packaged build uses resources/, dev uses src/db/migrations/
  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, 'migrations')
    : path.join(app.getAppPath(), 'src/db/migrations')

  if (!fs.existsSync(path.join(migrationsFolder, 'meta', '_journal.json'))) {
    console.error('[db] Migrations not found at:', migrationsFolder)
    throw new Error('Database migrations not found. Run: bun run db:generate')
  }

  migrate(db, { migrationsFolder })
  console.log('[db] Migrations applied successfully')

  return db
}

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}
