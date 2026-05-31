// ---------------------------------------------------------------------------
// EventPilot v0.1 — POST /api/tasks/[id]/redeem
//
// Accepts a redeem code, validates it, consumes it atomically, unlocks the
// task, and returns the full public task shape (including fullOutput).
//
// Transaction note (v0.1):
//   findAndConsumeCode runs in its own Drizzle transaction (atomic code
//   consumption).  setTaskUnlocked runs as a separate update.  There is a
//   sub-millisecond window between them where a crash would leave the code
//   consumed but the task still locked.  This is acceptable for v0.1 scale.
//   v0.2 should wrap both operations in a single db.transaction() call.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { getTaskById, setTaskUnlocked, toPublic } from '@/db/tasks'
import { findAndConsumeCode } from '@/db/redeem-codes'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Parse and validate request body --------------------------------------

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: '请求体必须是有效的 JSON' },
      { status: 400 },
    )
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as Record<string, unknown>).code !== 'string'
  ) {
    return NextResponse.json(
      { error: 'invalid_request', message: '请提供兑换码' },
      { status: 400 },
    )
  }

  const rawCode = (body as { code: string }).code

  if (!rawCode.trim()) {
    return NextResponse.json(
      { error: 'invalid_request', message: '兑换码不能为空' },
      { status: 400 },
    )
  }

  // 2. Read taskId from route params ----------------------------------------

  const { id: taskId } = await params

  // 3. Verify the task exists -----------------------------------------------

  let task
  try {
    task = await getTaskById(taskId)
  } catch (e) {
    console.error('Failed to read task for redeem:', e)
    return NextResponse.json(
      { error: 'server_error', message: '验证失败，请稍后重试' },
      { status: 500 },
    )
  }

  if (!task) {
    return NextResponse.json(
      { error: 'not_found', message: '任务不存在或链接已失效' },
      { status: 404 },
    )
  }

  // 4. Atomically consume the redeem code -----------------------------------

  const result = await findAndConsumeCode(rawCode, taskId)

  if (!result.ok) {
    if (result.error === 'invalid_code') {
      return NextResponse.json(
        { error: 'invalid_code', message: '兑换码无效，请检查后重试。' },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: 'code_already_used', message: '该兑换码已被使用。' },
      { status: 409 },
    )
  }

  // 5. Unlock the task ------------------------------------------------------

  let unlockedTask
  try {
    unlockedTask = await setTaskUnlocked(taskId)
  } catch (e) {
    // Code is already consumed (step 4 was atomic).  The task remains locked
    // but the code cannot be reused.  Log for manual intervention.
    console.error(
      `Redeem code ${result.code.code} consumed but task ${taskId} unlock failed:`,
      e,
    )
    return NextResponse.json(
      { error: 'server_error', message: '解锁失败，请联系管理员处理' },
      { status: 500 },
    )
  }

  // 6. Return public shape — fullOutput now included (unlocked === true) -----

  return NextResponse.json(toPublic(unlockedTask))
}
