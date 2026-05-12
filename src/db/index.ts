import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import * as schema from './schema'

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>

let db: DrizzleDB

interface JournalEntry {
  idx: number
  when: number
  tag: string
}

interface Journal {
  entries: JournalEntry[]
}

/**
 * Reads the Drizzle journal and ensures __drizzle_migrations is bootstrapped
 * for any migrations whose SQL has already been applied to the database.
 *
 * Strategy: a migration is considered "already applied" when every table and
 * column it would create/add is already present in the SQLite schema.
 * We mark those entries in __drizzle_migrations so Drizzle's runtime migrate()
 * skips them and only runs genuinely new migrations.
 */
function bootstrapMigrationLog(sqlite: Database.Database, migrationsFolder: string): void {
  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')
  if (!fs.existsSync(journalPath)) return

  const journal: Journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'))

  // Ensure the migrations log table exists (Drizzle also creates it, but we
  // need it before we can query or insert into it)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
      id   INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      hash TEXT    NOT NULL,
      created_at NUMERIC
    )
  `)

  // Fetch the highest already-recorded timestamp in one query
  const row = sqlite
    .prepare(`SELECT MAX(created_at) as maxTs FROM \`__drizzle_migrations\``)
    .get() as { maxTs: number | null }
  const maxRecorded = row.maxTs ?? 0

  // Collect existing tables and their columns from SQLite's own schema
  const tables = sqlite
    .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
    .all() as { name: string }[]

  const existingColumns = new Map<string, Set<string>>()
  for (const { name } of tables) {
    const cols = sqlite.pragma(`table_info(${name})`) as { name: string }[]
    existingColumns.set(name, new Set(cols.map((c) => c.name)))
  }

  // For each journal entry that is NOT yet recorded, check whether its SQL
  // is already fully reflected in the live schema.  If yes → mark as applied.
  const insertStmt = sqlite.prepare(
    `INSERT INTO \`__drizzle_migrations\` (hash, created_at) VALUES (?, ?)`
  )

  for (const entry of journal.entries) {
    if (entry.when <= maxRecorded) continue // already tracked

    const sqlFile = path.join(migrationsFolder, `${entry.tag}.sql`)
    if (!fs.existsSync(sqlFile)) continue

    if (isMigrationAlreadyApplied(existingColumns, sqlFile)) {
      insertStmt.run(`pre-applied:${entry.tag}`, entry.when)
      console.log(`[db] Marked migration as pre-applied: ${entry.tag}`)
    }
  }
}

/**
 * Heuristic: parse the migration SQL and check whether every CREATE TABLE /
 * ALTER TABLE ADD COLUMN statement it contains is already satisfied by the
 * live schema.  If all statements are already present → migration is applied.
 */
function isMigrationAlreadyApplied(
  existingColumns: Map<string, Set<string>>,
  sqlFile: string
): boolean {
  const sql = fs.readFileSync(sqlFile, 'utf8')

  // Split on drizzle breakpoints or semicolons
  const statements = sql
    .split(/-->[ \t]*statement-breakpoint|;/)
    .map((s) => s.trim())
    .filter(Boolean)

  for (const stmt of statements) {
    const upper = stmt.toUpperCase()

    // CREATE TABLE `name` (...)  → table must exist
    const createMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?/i)
    if (createMatch) {
      const tableName = createMatch[1].toLowerCase()
      if (!existingColumns.has(tableName)) return false
      continue
    }

    // ALTER TABLE `name` ADD [COLUMN] `col`
    const alterMatch = stmt.match(
      /ALTER\s+TABLE\s+[`"']?(\w+)[`"']?\s+ADD\s+(?:COLUMN\s+)?[`"']?(\w+)[`"']?/i
    )
    if (alterMatch) {
      const tableName = alterMatch[1].toLowerCase()
      const colName = alterMatch[2].toLowerCase()
      const cols = existingColumns.get(tableName)
      if (!cols || !cols.has(colName)) return false
      continue
    }

    // Any other statement type (CREATE INDEX, etc.) — assume not blocking
    if (!upper.startsWith('CREATE') && !upper.startsWith('ALTER')) continue
  }

  return true
}

export function initDatabase(): DrizzleDB {
  const userDataPath = app.getPath('userData')
  const dbDir = path.join(userDataPath, 'data')
  const dbPath = path.join(dbDir, 'app.db')

  fs.mkdirSync(dbDir, { recursive: true })

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite, { schema })

  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, 'migrations')
    : path.join(app.getAppPath(), 'src/db/migrations')

  if (fs.existsSync(path.join(migrationsFolder, 'meta', '_journal.json'))) {
    bootstrapMigrationLog(sqlite, migrationsFolder)
    migrate(db, { migrationsFolder })
    console.log('[db] Migrations applied from:', migrationsFolder)
  } else {
    console.warn('[db] No migration folder found — skipping migrations')
  }

  return db
}

export function getDatabase(): DrizzleDB {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}
