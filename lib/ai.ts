// ---------------------------------------------------------------------------
// EventPilot v0.1 — AI generation module
//
// Calls an OpenAI-compatible /chat/completions endpoint to generate
// structured activity documents in Simplified Chinese.
//
// Provider-agnostic: set AI_BASE_URL + AI_MODEL to switch between
// DeepSeek, Moonshot, Zhipu, Qwen, OpenAI, or any compatible API.
//
// All provider-specific logic (fetch, headers, response_format) lives here.
// The rest of the codebase only sees typed input → typed output.
// ---------------------------------------------------------------------------

import type { ResultSection } from '@/lib/tasks'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateTaskInput {
  mode: 'startup' | 'review' | 'handoff'
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

export interface GenerateTaskOutput {
  previewSections: ResultSection[]
  fullSections: ResultSection[]
  meta: {
    audience: string
    date: string
    venue: string
    budget: string
  }
}

// ---------------------------------------------------------------------------
// Mode-specific context
// ---------------------------------------------------------------------------

const MODE_LABELS: Record<GenerateTaskInput['mode'], string> = {
  startup: '活动启动包',
  review: '活动复盘包',
  handoff: '换届交接包',
}

const MODE_INSTRUCTIONS: Record<GenerateTaskInput['mode'], string> = {
  startup:
    '用户正在策划一个新活动。请生成完整的活动启动包，帮助团队从零开始准备。内容包括活动概览、时间线、预算、分工、当天流程和检查清单。',
  review:
    '用户需要对已结束的活动进行复盘。请生成活动复盘包，帮助团队整理活动数据、总结经验教训、发现问题并提出改进建议。如果用户未提供活动的实际数据或反馈，在相关章节中标注「需补充信息」。',
  handoff:
    '用户需要把活动经验和流程交接给下一届负责人。请生成换届交接包，重点是流程文档、注意事项、历史经验和可复用的模板。语气应面向接手的新人，清楚说明「做什么」和「为什么」。',
}

// ---------------------------------------------------------------------------
// Truncation
// ---------------------------------------------------------------------------

const MAX_PASTED_MATERIALS_LENGTH = 20_000

function truncate(text: string | undefined, max: number): string {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max) + '\n\n…（内容过长，已截断前 ' + max + ' 个字符）'
}

// ---------------------------------------------------------------------------
// System prompt (Simplified Chinese)
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `你是一个活动流程助手，专门帮助中国的大学生社团、学生组织和小型团队生成活动文档。你的角色是活动秘书和流程顾问——实用、清楚、不啰嗦、不写广告文案、不说空洞的套话。

## 输出格式

你必须返回一个严格的 JSON 对象，格式如下：

{
  "previewSections": [
    {
      "title": "活动概览",
      "summary": "一段 2-3 句话概述这个活动",
      "items": ["要点 1", "要点 2", "要点 3"]
    }
  ],
  "fullSections": [
    {
      "title": "活动概览",
      "summary": "一段 2-3 句话概述这个活动",
      "items": ["要点 1", "要点 2", "要点 3"]
    },
    {
      "title": "时间线 Checklist",
      "summary": "按周或按阶段的筹备时间线说明",
      "items": ["第 8 周：……", "第 6 周：……", "第 4 周：……", "第 2 周：……"]
    },
    {
      "title": "预算项目清单",
      "summary": "预算整体说明",
      "items": ["场地及设备：¥……", "宣传物料：¥……", "……"]
    },
    {
      "title": "人员分工建议",
      "summary": "分工说明",
      "items": ["活动总负责人：……", "宣传组：……", "物资组：……", "接待组：……"]
    },
    {
      "title": "活动当天流程",
      "summary": "活动日执行说明",
      "items": ["12:00 — ……", "13:30 — ……", "14:00 — ……"]
    },
    {
      "title": "活动前 48 小时检查清单",
      "summary": "最后确认事项说明",
      "items": ["与场地确认……", "打印签到表……", "检查设备……"]
    }
  ],
  "meta": {
    "audience": "面向对象（如未提供则为「待确认」）",
    "date": "活动时间（如未提供则为「待确认」）",
    "venue": "活动地点（如未提供则为「待确认」）",
    "budget": "预算范围（如未提供则为「待确认」）"
  }
}

## 内容规则

- previewSections 只包含「活动概览」一个 section。
- fullSections 包含全部 6 个 section，按上述顺序排列。
- 每个 section 的 items 数组至少包含 3 条具体、可执行的内容。
- 不要编造用户没有提供的信息。如果某个信息缺失，在对应字段填写「待确认」或在 items 中添加「需补充：……」条目。
- 如果用户粘贴了已有资料，优先参考其中的信息。
- 金额使用人民币 ¥ 标注。
- 所有内容使用简体中文。

## 语气

- 像活动秘书或流程顾问，不像广告文案或通用 AI 聊天机器人。
- 实用、具体、可执行。
- 不要说「您可以通过以下方式……」或「希望这份方案能帮助您……」之类的套话。
- 不要加免责声明或「以上内容由 AI 生成」标识。`
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(input: GenerateTaskInput): string {
  const modeLabel = MODE_LABELS[input.mode]
  const modeInstruction = MODE_INSTRUCTIONS[input.mode]

  const lines: string[] = [
    `请为以下活动生成一份「${modeLabel}」。`,
    '',
    modeInstruction,
    '',
    '## 活动信息',
    '',
    `- 活动名称：${input.activityName}`,
    `- 组织名称：${input.organizationName}`,
  ]

  if (input.activityType) lines.push(`- 活动类型：${input.activityType}`)
  if (input.expectedParticipants) lines.push(`- 预计人数：${input.expectedParticipants}`)
  if (input.dateOrPeriod) lines.push(`- 时间周期：${input.dateOrPeriod}`)
  if (input.location) lines.push(`- 地点：${input.location}`)
  if (input.budgetRange) lines.push(`- 预算范围：${input.budgetRange}`)
  if (input.targetAudience) lines.push(`- 面向对象：${input.targetAudience}`)
  if (input.extraContext) {
    lines.push('')
    lines.push('## 补充背景')
    lines.push('')
    lines.push(input.extraContext)
  }

  const pasted = truncate(input.pastedMaterials, MAX_PASTED_MATERIALS_LENGTH)
  if (pasted) {
    lines.push('')
    lines.push('## 已有资料（供参考）')
    lines.push('')
    lines.push(pasted)
  }

  lines.push('')
  lines.push('请直接返回 JSON，不要包含任何解释文字。')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Expected section titles per mode (used as fallbacks for empty titles)
// ---------------------------------------------------------------------------

const EXPECTED_SECTION_TITLES: Record<GenerateTaskInput['mode'], string[]> = {
  startup: [
    '活动概览',
    '时间线 Checklist',
    '预算项目清单',
    '人员分工建议',
    '活动当天流程',
    '活动前 48 小时检查清单',
  ],
  review: [
    '活动回顾',
    '数据与反馈汇总',
    '问题与不足',
    '改进建议',
    '经验总结',
    '后续行动清单',
  ],
  handoff: [
    '活动概况',
    '流程文档',
    '关键联系人',
    '历史经验',
    '注意事项',
    '可复用资源',
  ],
}

/**
 * Replace empty section titles with position-based fallbacks.
 * Non-empty titles are left unchanged — this only patches gaps.
 */
function applyFallbackTitles(
  sections: ResultSection[],
  mode: GenerateTaskInput['mode'],
): ResultSection[] {
  const expected = EXPECTED_SECTION_TITLES[mode]
  return sections.map((section, i) => {
    if (section.title && section.title.trim()) return section
    const fallback = expected[i] || `第 ${i + 1} 部分`
    return { ...section, title: fallback }
  })
}

// ---------------------------------------------------------------------------
// Response validation
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateShape(raw: any): GenerateTaskOutput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI response is not a JSON object')
  }

  if (!Array.isArray(raw.previewSections)) {
    throw new Error('AI response missing previewSections array')
  }

  if (!Array.isArray(raw.fullSections)) {
    throw new Error('AI response missing fullSections array')
  }

  if (raw.fullSections.length < 2) {
    throw new Error(
      `AI response fullSections has only ${raw.fullSections.length} sections (expected at least 2)`,
    )
  }

  if (!raw.meta || typeof raw.meta !== 'object') {
    throw new Error('AI response missing meta object')
  }

  const meta = raw.meta as Record<string, unknown>
  const requiredMetaKeys = ['audience', 'date', 'venue', 'budget']

  for (const key of requiredMetaKeys) {
    if (typeof meta[key] !== 'string') {
      throw new Error(`AI response meta.${key} is missing or not a string`)
    }
  }

  // Normalise sections to ensure they have the right shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSection(s: any): ResultSection {
    return {
      id: s.id || '',
      title: typeof s.title === 'string' ? s.title : '',
      summary: typeof s.summary === 'string' ? s.summary : '',
      items: Array.isArray(s.items)
        ? s.items.filter((i: unknown) => typeof i === 'string')
        : [],
    }
  }

  return {
    previewSections: raw.previewSections.map(normaliseSection),
    fullSections: raw.fullSections.map(normaliseSection),
    meta: {
      audience: meta.audience as string,
      date: meta.date as string,
      venue: meta.venue as string,
      budget: meta.budget as string,
    },
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generate structured activity document sections from user input.
 *
 * Calls the configured AI provider (OpenAI-compatible API).
 * Throws if AI_API_KEY is missing, the network call fails, or the
 * response JSON does not match the expected shape.
 */
export async function generateTaskSections(
  input: GenerateTaskInput,
): Promise<GenerateTaskOutput> {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) {
    throw new Error(
      'AI_API_KEY is not configured. Set it in .env to enable AI generation.',
    )
  }

  const baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.AI_MODEL || 'gpt-4o-mini'

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(input) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `AI API returned ${response.status} ${response.statusText}${body ? ': ' + body.slice(0, 500) : ''}`,
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error('AI API returned non-JSON response')
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content || typeof content !== 'string') {
    throw new Error('AI API response missing content')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    // The model may have wrapped JSON in markdown fences — try to extract.
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try {
        parsed = JSON.parse(match[1].trim())
      } catch {
        throw new Error('AI response content is not valid JSON')
      }
    } else {
      throw new Error('AI response content is not valid JSON')
    }
  }

  const output = validateShape(parsed)

  // Patch empty section titles with mode-appropriate fallbacks.
  output.previewSections = applyFallbackTitles(output.previewSections, input.mode)
  output.fullSections = applyFallbackTitles(output.fullSections, input.mode)

  return output
}
