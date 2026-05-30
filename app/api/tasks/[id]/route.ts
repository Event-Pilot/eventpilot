// ---------------------------------------------------------------------------
// EventPilot v0.1 — GET /api/tasks/[id]
//
// Reads a single task by ID and returns the public-safe shape.
// fullOutput is gated by toPublic() — only included when unlocked === true.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { getTaskById, toPublic } from '@/db/tasks'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let task
  try {
    const { id } = await params
    task = await getTaskById(id)
  } catch (e) {
    console.error('Failed to read task:', e)
    return NextResponse.json(
      { error: 'server_error', message: '读取任务失败，请稍后重试' },
      { status: 500 },
    )
  }

  if (!task) {
    return NextResponse.json(
      { error: 'not_found', message: '任务不存在或链接已失效' },
      { status: 404 },
    )
  }

  return NextResponse.json(toPublic(task))
}
