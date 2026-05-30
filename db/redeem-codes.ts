// ---------------------------------------------------------------------------
// EventPilot v0.1 — Redeem code data access layer
//
// All redeem-code database operations live here.  API routes import only from
// this file — they never touch db/index.ts, db/schema.ts, or better-sqlite3.
//
// Concurrency: findAndConsumeCode runs inside a Drizzle transaction so two
// simultaneous requests cannot consume the same code.
// ---------------------------------------------------------------------------

import { eq } from 'drizzle-orm'
import { db } from './index'
import { redeemCodes } from './schema'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RedeemCodeRow {
  id: number
  code: string
  taskId: string | null // null = unused; set to a task.id on redemption
  usedAt: string | null // ISO 8601, null until used
  createdAt: string
}

export type RedeemCodeConsumeResult =
  | { ok: true; code: RedeemCodeRow }
  | { ok: false; error: 'invalid_code' }
  | { ok: false; error: 'code_already_used' }

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a raw Drizzle row into a typed RedeemCodeRow.
 */
function toRedeemCodeRow(
  row: typeof redeemCodes.$inferSelect,
): RedeemCodeRow {
  return {
    id: row.id,
    code: row.code,
    taskId: row.taskId,
    usedAt: row.usedAt,
    createdAt: row.createdAt,
  }
}

/**
 * Normalize user-supplied code input: trim whitespace, convert to uppercase.
 */
function normalizeCode(input: string): string {
  return input.trim().toUpperCase()
}

// ---------------------------------------------------------------------------
// Exported operations
// ---------------------------------------------------------------------------

/**
 * Bulk-insert redeem codes into the database.
 * Skips duplicate codes silently (UNIQUE constraint on `code` column).
 * Returns the number of codes successfully inserted.
 */
export async function createRedeemCodes(codes: string[]): Promise<number> {
  const now = new Date().toISOString()
  let count = 0

  for (const code of codes) {
    const normalized = normalizeCode(code)
    if (!normalized) continue

    try {
      await db.insert(redeemCodes).values({
        code: normalized,
        createdAt: now,
      })
      count++
    } catch {
      // UNIQUE constraint violation — code already exists, skip silently
    }
  }

  return count
}

/**
 * Look up a redeem code by its code string.
 * Returns undefined if no row matches.
 */
export async function getRedeemCodeByCode(
  code: string,
): Promise<RedeemCodeRow | undefined> {
  const normalized = normalizeCode(code)
  if (!normalized) return undefined

  const row = await db
    .select()
    .from(redeemCodes)
    .where(eq(redeemCodes.code, normalized))
    .get()

  if (!row) return undefined

  return toRedeemCodeRow(row)
}

/**
 * Atomically consume a redeem code for a specific task.
 *
 * Runs inside a Drizzle transaction.  SQLite serialises write transactions,
 * so two concurrent attempts to consume the same code cannot both succeed:
 * the second transaction will see `taskId` already set by the first.
 *
 * Normalises the input code to uppercase before lookup.
 *
 * Returns:
 *   { ok: true,  code } — code successfully consumed
 *   { ok: false, error: 'invalid_code' } — no such code
 *   { ok: false, error: 'code_already_used' } — code has taskId set already
 */
export async function findAndConsumeCode(
  code: string,
  taskId: string,
): Promise<RedeemCodeConsumeResult> {
  const normalized = normalizeCode(code)
  if (!normalized) {
    return { ok: false, error: 'invalid_code' }
  }

  return db.transaction(async (tx) => {
    // 1. Read the code row inside the transaction.
    const row = await tx
      .select()
      .from(redeemCodes)
      .where(eq(redeemCodes.code, normalized))
      .get()

    if (!row) {
      return { ok: false, error: 'invalid_code' }
    }

    // 2. Check if already used.
    if (row.taskId !== null) {
      return { ok: false, error: 'code_already_used' }
    }

    // 3. Mark as consumed — set taskId and usedAt.
    const now = new Date().toISOString()
    await tx
      .update(redeemCodes)
      .set({ taskId, usedAt: now })
      .where(eq(redeemCodes.code, normalized))

    // 4. Return the updated row.
    return {
      ok: true,
      code: {
        id: row.id,
        code: row.code,
        taskId,
        usedAt: now,
        createdAt: row.createdAt,
      },
    }
  })
}
