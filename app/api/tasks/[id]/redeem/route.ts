// ---------------------------------------------------------------------------
// EventPilot v0.1 — POST /api/tasks/[id]/redeem
//
// Validates a redeem code and atomically consumes it + unlocks the task in
// a single database transaction.  Returns the full public task shape
// (including fullOutput) on success.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { getTaskById, toPublic } from '@/db/tasks'
import { redeemCodeAndUnlockTask } from '@/db/redeem-codes'

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

  // 4. Atomically consume code AND unlock task (single transaction) ---------

  const result = await redeemCodeAndUnlockTask(rawCode, taskId)

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

  // 5. Re-fetch the now-unlocked task and return public shape ----------------

  try {
    const unlockedTask = await getTaskById(taskId)
    if (!unlockedTask) {
      // Should not happen — task was verified in step 3 and still exists.
      console.error(`Task ${taskId} vanished during redeem — possible data corruption`)
      return NextResponse.json(
        { error: 'server_error', message: '解锁失败，请稍后重试' },
        { status: 500 },
      )
    }
    return NextResponse.json(toPublic(unlockedTask))
  } catch (e) {
    console.error('Failed to read task after unlock:', e)
    return NextResponse.json(
      { error: 'server_error', message: '解锁失败，请稍后重试' },
      { status: 500 },
    )
  }
}
