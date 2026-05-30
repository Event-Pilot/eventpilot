// ---------------------------------------------------------------------------
// EventPilot v0.1 — Database connection (SQLite via better-sqlite3 + Drizzle)
//
// This is the ONLY file that imports 'better-sqlite3'.
// On PostgreSQL migration day, replace this entire file with a pg Pool
// and import { drizzle } from 'drizzle-orm/node-postgres'.
// ---------------------------------------------------------------------------

import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const DB_PATH = process.env.DATABASE_URL || 'data/eventpilot.db'

// Ensure the parent directory exists (e.g. data/) before opening the file.
mkdirSync(dirname(DB_PATH), { recursive: true })

const sqlite = new Database(DB_PATH)

// WAL mode — concurrent readers are not blocked by writers.
sqlite.pragma('journal_mode = WAL')

// Enable foreign key enforcement.
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export type DbClient = typeof db
