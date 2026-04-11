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

  // Always apply inline schema first (idempotent CREATE TABLE IF NOT EXISTS)
  // This guarantees the table exists even if migration files are missing from the bundle
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS \`profiles\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`application_id\` text NOT NULL,
      \`details\` text,
      \`state\` text,
      \`large_image_key\` text,
      \`large_image_text\` text,
      \`small_image_key\` text,
      \`small_image_text\` text,
      \`button1_label\` text,
      \`button1_url\` text,
      \`button2_label\` text,
      \`button2_url\` text,
      \`party_size\` integer,
      \`party_max\` integer,
      \`show_elapsed_time\` integer DEFAULT false NOT NULL,
      \`sort_order\` integer DEFAULT 0 NOT NULL,
      \`created_at\` integer NOT NULL,
      \`updated_at\` integer NOT NULL
    );
  `)

  // Run drizzle migrations on top (adds new columns in future updates)
  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, 'migrations')
    : path.join(app.getAppPath(), 'src/db/migrations')

  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')
  if (fs.existsSync(journalPath)) {
    migrate(db, { migrationsFolder })
    console.log('[db] Migrations applied from:', migrationsFolder)
  } else {
    console.warn('[db] No migration folder found — using inline schema only')
  }

  return db
}

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}
