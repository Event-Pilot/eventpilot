// ---------------------------------------------------------------------------
// EventPilot v0.1 — Database schema (SQLite via Drizzle)
//
// This is the ONLY file that imports from 'drizzle-orm/sqlite-core'.
// On PostgreSQL migration day, replace these sqliteTable/text/integer
// imports with pgTable/varchar/boolean/jsonb/timestamp from pg-core.
//
// Column naming: snake_case in the database, camelCase in the DAL.
// ---------------------------------------------------------------------------

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// ---------------------------------------------------------------------------
// tasks
// ---------------------------------------------------------------------------

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),

  // ---- form fields --------------------------------------------------------
  mode: text('mode').notNull(), // 'startup' | 'review' | 'handoff'
  activityName: text('activity_name').notNull(),
  organizationName: text('organization_name').notNull(),
  activityType: text('activity_type'),
  expectedParticipants: integer('expected_participants'),
  dateOrPeriod: text('date_or_period'),
  location: text('location'),
  budgetRange: text('budget_range'),
  targetAudience: text('target_audience'),
  extraContext: text('extra_context'),
  pastedMaterials: text('pasted_materials'),

  // ---- generation lifecycle -----------------------------------------------
  status: text('status').notNull().default('generating'), // 'generating' | 'ready' | 'error'
  previewOutput: text('preview_output'), // JSON string — free sections
  fullOutput: text('full_output'), // JSON string — all sections
  unlocked: integer('unlocked').notNull().default(0), // 0 = locked, 1 = unlocked

  // ---- timestamps (ISO 8601 strings) --------------------------------------
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// ---------------------------------------------------------------------------
// redeem_codes
// ---------------------------------------------------------------------------

export const redeemCodes = sqliteTable('redeem_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // uppercase, e.g. PILOT-A3K9-M7X2
  taskId: text('task_id'), // NULL = unused; set to a task.id on redemption
  usedAt: text('used_at'), // ISO 8601, null until used
  createdAt: text('created_at').notNull(),
})
