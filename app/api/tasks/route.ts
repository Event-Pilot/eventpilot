// ---------------------------------------------------------------------------
// EventPilot v0.1 — POST /api/tasks
//
// Accepts task creation form data, validates it, creates a DB row, calls the
// AI module to generate structured sections, stores the result, and returns
// the public-safe preview output.
//
// SECURITY: fullOutput is written to the database but NEVER included in the
// response from this endpoint.  It can only be obtained via a redeem unlock.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { createTask, saveTaskGenerationResult, setTaskError } from '@/db/tasks'
import { generateTaskSections } from '@/lib/ai'
import type { CreateTaskInput, TaskMode } from '@/db/tasks'
import type { GenerateTaskInput } from '@/lib/ai'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_MODES: TaskMode[] = ['startup', 'review', 'handoff']

const MAX_PASTED_MATERIALS = 20_000

interface ValidatedInput {
  mode: TaskMode
  activityName: string
  organizationName: string
  activityType?: string
  expectedParticipants: number | null
  dateOrPeriod?: string
  location?: string
  budgetRange?: string
  targetAudience?: string
  extraContext?: string
  pastedMaterials?: string
}

/**
 * Parse and validate the request body.
 * Returns the validated input or a 400 NextResponse.
 */
function validateBody(body: unknown): ValidatedInput | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: '请求体不能为空' },
      { status: 400 },
    )
  }

  const b = body as Record<string, unknown>

  // ---- required fields ----------------------------------------------------

  const activityName = b.activityName
  if (!activityName || typeof activityName !== 'string' || !activityName.trim()) {
    return NextResponse.json(
      { error: '活动名称不能为空' },
      { status: 400 },
    )
  }

  const organizationName = b.organizationName
  if (!organizationName || typeof organizationName !== 'string' || !organizationName.trim()) {
    return NextResponse.json(
      { error: '组织名称不能为空' },
      { status: 400 },
    )
  }

  // ---- mode ---------------------------------------------------------------

  const mode = b.mode
  if (!mode || typeof mode !== 'string' || !VALID_MODES.includes(mode as TaskMode)) {
    return NextResponse.json(
      { error: '生成模式必须是 startup、review 或 handoff' },
      { status: 400 },
    )
  }

  // ---- optional fields — normalise ----------------------------------------

  let expectedParticipants: number | null = null
  if (b.expectedParticipants !== undefined && b.expectedParticipants !== null && b.expectedParticipants !== '') {
    const n = Number(b.expectedParticipants)
    if (!Number.isNaN(n) && n > 0) {
      expectedParticipants = Math.floor(n)
    }
  }

  let pastedMaterials: string | undefined
  if (typeof b.pastedMaterials === 'string' && b.pastedMaterials.trim()) {
    pastedMaterials = b.pastedMaterials.slice(0, MAX_PASTED_MATERIALS)
  }

  return {
    mode: mode as TaskMode,
    activityName: activityName.trim(),
    organizationName: organizationName.trim(),
    activityType: typeof b.activityType === 'string' ? b.activityType.trim() || undefined : undefined,
    expectedParticipants,
    dateOrPeriod: typeof b.dateOrPeriod === 'string' ? b.dateOrPeriod.trim() || undefined : undefined,
    location: typeof b.location === 'string' ? b.location.trim() || undefined : undefined,
    budgetRange: typeof b.budgetRange === 'string' ? b.budgetRange.trim() || undefined : undefined,
    targetAudience: typeof b.targetAudience === 'string' ? b.targetAudience.trim() || undefined : undefined,
    extraContext: typeof b.extraContext === 'string' ? b.extraContext.trim() || undefined : undefined,
    pastedMaterials,
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: '请求体必须是有效的 JSON' },
      { status: 400 },
    )
  }

  // 1. Validate
  const validated = validateBody(body)
  if (validated instanceof NextResponse) return validated

  // 2. Build DAL input and create task
  const createInput: CreateTaskInput = {
    mode: validated.mode,
    activityName: validated.activityName,
    organizationName: validated.organizationName,
    activityType: validated.activityType,
    expectedParticipants: validated.expectedParticipants ?? undefined,
    dateOrPeriod: validated.dateOrPeriod,
    location: validated.location,
    budgetRange: validated.budgetRange,
    targetAudience: validated.targetAudience,
    extraContext: validated.extraContext,
    pastedMaterials: validated.pastedMaterials,
  }

  let task
  try {
    task = await createTask(createInput)
  } catch (e) {
    console.error('Failed to create task row:', e)
    return NextResponse.json(
      { error: '创建任务失败，请稍后重试' },
      { status: 500 },
    )
  }

  // 3. Call AI generation
  const aiInput: GenerateTaskInput = {
    mode: validated.mode,
    activityName: validated.activityName,
    organizationName: validated.organizationName,
    activityType: validated.activityType,
    expectedParticipants: validated.expectedParticipants ?? undefined,
    dateOrPeriod: validated.dateOrPeriod,
    location: validated.location,
    budgetRange: validated.budgetRange,
    targetAudience: validated.targetAudience,
    extraContext: validated.extraContext,
    pastedMaterials: validated.pastedMaterials,
  }

  try {
    const result = await generateTaskSections(aiInput)

    // 4. Store result
    const updated = await saveTaskGenerationResult(task.id, {
      previewSections: result.previewSections,
      fullSections: result.fullSections,
    })

    // 5. Return public-safe preview (fullOutput NEVER included)
    return NextResponse.json(
      {
        id: updated.id,
        status: updated.status,
        previewOutput: updated.previewOutput,
        meta: result.meta,
      },
      { status: 201 },
    )
  } catch (e) {
    // AI generation failed — mark task as error so the client can see it.
    console.error('AI generation failed for task', task.id, ':', e)

    try {
      await setTaskError(task.id)
    } catch (dbError) {
      console.error('Failed to mark task as error:', dbError)
    }

    const message =
      e instanceof Error ? e.message : 'AI 生成失败，请稍后重试'

    return NextResponse.json(
      {
        id: task.id,
        error: 'generation_failed',
        message: message.includes('AI_API_KEY')
          ? 'AI 服务未配置，请联系管理员'
          : 'AI 生成失败，请稍后重试',
      },
      { status: 500 },
    )
  }
}
