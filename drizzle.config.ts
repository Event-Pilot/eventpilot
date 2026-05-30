// ---------------------------------------------------------------------------
// EventPilot v0.1 — Drizzle Kit configuration
//
// Used by `npx drizzle-kit generate` and `npx drizzle-kit migrate`.
// On PostgreSQL migration day, change `driver` and `dbCredentials.url`.
// ---------------------------------------------------------------------------

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'data/eventpilot.db',
  },
})
