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

  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')

  if (fs.existsSync(journalPath)) {
    migrate(db, { migrationsFolder })
    console.log('[db] Migrations applied successfully')
  } else {
    console.warn('[db] Migrations folder not found at:', migrationsFolder)
    console.warn('[db] Falling back to inline schema creation')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        client_id TEXT NOT NULL,
        details TEXT,
        state TEXT,
        large_image_key TEXT,
        large_image_text TEXT,
        small_image_key TEXT,
        small_image_text TEXT,
        button1_label TEXT,
        button1_url TEXT,
        button2_label TEXT,
        button2_url TEXT,
        start_timestamp INTEGER,
        end_timestamp INTEGER,
        enable_timestamps INTEGER DEFAULT 0 NOT NULL,
        party_size INTEGER,
        party_max INTEGER,
        created_at INTEGER,
        updated_at INTEGER
      );
    `)
    console.log('[db] Inline schema created successfully')
  }

  return db
}

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}
