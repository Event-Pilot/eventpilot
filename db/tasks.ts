// ---------------------------------------------------------------------------
// EventPilot v0.1 — Task data access layer
//
// All task database operations live here.  API routes import only from this
// file — they never touch db/index.ts, db/schema.ts, or better-sqlite3.
//
// JSON handling: preview_output and full_output are stored as text in SQLite.
// This file does JSON.parse / JSON.stringify at the boundary so API routes
// and frontend code receive typed ResultSection[] arrays.
//
// Boolean handling: SQLite stores unlocked as integer (0/1).  This file
// converts to boolean in TaskRow.  API routes only see boolean.
// ---------------------------------------------------------------------------

import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from './index'
import { tasks } from './schema'
import type { ResultSection } from '@/lib/tasks'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskMode = 'startup' | 'review' | 'handoff'

export type TaskStatus = 'generating' | 'ready' | 'error'

export interface CreateTaskInput {
  mode: TaskMode
  activityName: string
  organizationName: string
  activityType?: string
  expectedParticipants?: number
  dateOrPeriod?: string
  location?: string
  budgetRange?: string
  targetAudience?: string
  extraContext?: string
  pastedMaterials?: string
}

export interface GenerationResult {
  previewSections: ResultSection[]
  fullSections: ResultSection[]
}

// ---- Row shape (internal — after JSON parse & boolean conversion) ----------

export interface TaskRow {
  id: string
  mode: string
  activityName: string
  organizationName: string
  activityType: string | null
  expectedParticipants: number | null
  dateOrPeriod: string | null
  location: string | null
  budgetRange: string | null
  targetAudience: string | null
  extraContext: string | null
  pastedMaterials: string | null
  status: TaskStatus
  previewOutput: ResultSection[] | null
  fullOutput: ResultSection[] | null
  unlocked: boolean
  createdAt: string
  updatedAt: string
}

// ---- Public shape (fullOutput gated by unlocked) ---------------------------

export interface TaskPublic {
  id: string
  mode: string
  activityName: string
  organizationName: string
  activityType: string | null
  expectedParticipants: number | null
  dateOrPeriod: string | null
  location: string | null
  budgetRange: string | null
  targetAudience: string | null
  extraContext: string | null
  pastedMaterials: string | null
  status: TaskStatus
  previewOutput: ResultSection[] | null
  fullOutput: ResultSection[] | null // ONLY present when unlocked === true
  unlocked: boolean
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a raw Drizzle row (from SQLite) into a typed TaskRow:
 * - Parse JSON strings → ResultSection[]
 * - Convert unlocked integer → boolean
 * - Narrow status to TaskStatus union
 */
function toTaskRow(row: typeof tasks.$inferSelect): TaskRow {
  return {
    ...row,
    status: row.status as TaskStatus,
    previewOutput: row.previewOutput ? JSON.parse(row.previewOutput) : null,
    fullOutput: row.fullOutput ? JSON.parse(row.fullOutput) : null,
    unlocked: row.unlocked === 1,
  }
}

// ---------------------------------------------------------------------------
// Exported operations
// ---------------------------------------------------------------------------

/**
 * Create a new task row with status 'generating'.
 * Returns the full TaskRow after insertion.
 */
export async function createTask(input: CreateTaskInput): Promise<TaskRow> {
  const id = nanoid(8)
  const now = new Date().toISOString()

  await db.insert(tasks).values({
    id,
    mode: input.mode,
    activityName: input.activityName,
    organizationName: input.organizationName,
    activityType: input.activityType ?? null,
    expectedParticipants: input.expectedParticipants ?? null,
    dateOrPeriod: input.dateOrPeriod ?? null,
    location: input.location ?? null,
    budgetRange: input.budgetRange ?? null,
    targetAudience: input.targetAudience ?? null,
    extraContext: input.extraContext ?? null,
    pastedMaterials: input.pastedMaterials ?? null,
    status: 'generating',
    unlocked: 0,
    createdAt: now,
    updatedAt: now,
  })

  // SQLite INSERT does not return the row — re-fetch.
  return getTaskById(id) as Promise<TaskRow>
}

/**
 * Read a single task by ID.
 * Returns undefined if no row matches.
 */
export async function getTaskById(id: string): Promise<TaskRow | undefined> {
  const row = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .get()

  if (!row) return undefined

  return toTaskRow(row)
}

/**
 * Store AI generation output for an existing task.
 * Sets status to 'ready'.
 * Returns the updated TaskRow.
 */
export async function saveTaskGenerationResult(
  id: string,
  result: GenerationResult,
): Promise<TaskRow> {
  const now = new Date().toISOString()

  await db
    .update(tasks)
    .set({
      previewOutput: JSON.stringify(result.previewSections),
      fullOutput: JSON.stringify(result.fullSections),
      status: 'ready',
      updatedAt: now,
    })
    .where(eq(tasks.id, id))

  return getTaskById(id) as Promise<TaskRow>
}

/**
 * Mark a task as 'error' — used when AI generation fails.
 * Returns the updated TaskRow.
 */
export async function setTaskError(id: string): Promise<TaskRow> {
  const now = new Date().toISOString()

  await db
    .update(tasks)
    .set({
      status: 'error',
      updatedAt: now,
    })
    .where(eq(tasks.id, id))

  return getTaskById(id) as Promise<TaskRow>
}

/**
 * Mark a task as unlocked (after successful code redemption).
 * Returns the updated TaskRow.
 */
export async function setTaskUnlocked(id: string): Promise<TaskRow> {
  const now = new Date().toISOString()

  await db
    .update(tasks)
    .set({
      unlocked: 1,
      updatedAt: now,
    })
    .where(eq(tasks.id, id))

  return getTaskById(id) as Promise<TaskRow>
}

// ---------------------------------------------------------------------------
// Public projection
// ---------------------------------------------------------------------------

/**
 * Convert a TaskRow into the public-safe TaskPublic shape.
 *
 * CENTRAL SECURITY RULE:
 *   fullOutput is included ONLY when unlocked === true.
 *   All API routes that return task data MUST pass through this function.
 */
export function toPublic(task: TaskRow): TaskPublic {
  return {
    id: task.id,
    mode: task.mode,
    activityName: task.activityName,
    organizationName: task.organizationName,
    activityType: task.activityType,
    expectedParticipants: task.expectedParticipants,
    dateOrPeriod: task.dateOrPeriod,
    location: task.location,
    budgetRange: task.budgetRange,
    targetAudience: task.targetAudience,
    extraContext: task.extraContext,
    pastedMaterials: task.pastedMaterials,
    status: task.status,
    previewOutput: task.previewOutput,
    fullOutput: task.unlocked ? task.fullOutput : null,
    unlocked: task.unlocked,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}
