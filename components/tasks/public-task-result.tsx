'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Lock,
  Check,
  Copy,
  KeyRound,
  AlertCircle,
  Sparkles,
  CalendarDays,
  Users,
  MapPin,
  Wallet,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ResultSection } from '@/lib/tasks'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODE_LABELS: Record<string, string> = {
  startup: '活动启动包',
  review: '活动复盘包',
  handoff: '换届交接包',
}

/** Placeholder sections shown while content is locked. */
const LOCKED_PLACEHOLDER_SECTIONS: ResultSection[] = [
  {
    id: 'timeline',
    title: '时间线 Checklist',
    summary: '筹备周期和各阶段里程碑。',
    items: ['解锁后查看完整时间线'],
    locked: true,
  },
  {
    id: 'budget',
    title: '预算项目清单',
    summary: '按项目列出的预算明细。',
    items: ['解锁后查看预算明细'],
    locked: true,
  },
  {
    id: 'roles',
    title: '人员分工建议',
    summary: '各岗位职责和备选联系人。',
    items: ['解锁后查看分工详情'],
    locked: true,
  },
  {
    id: 'schedule',
    title: '活动当天流程',
    summary: '活动日按分钟排布的执行时间表。',
    items: ['解锁后查看当天流程'],
    locked: true,
  },
  {
    id: 'checklist',
    title: '活动前 48 小时检查清单',
    summary: '最后确认事项，确保不遗漏。',
    items: ['解锁后查看检查清单'],
    locked: true,
  },
]

const LOCKED_SECTION_DESCRIPTIONS = [
  '时间线 Checklist、预算项目清单、人员分工建议',
  '活动当天流程、活动前 48 小时检查清单',
]

const FREE_SECTION_IDS = new Set(['overview'])

// ---------------------------------------------------------------------------
// Demo fallback (used when /tasks/demo loads with no backend)
// ---------------------------------------------------------------------------

const demoResult = {
  title: '2026 春季社团文化节',
  type: '活动启动包',
  meta: {
    audience: '全校学生（约 180 人）',
    date: '2026 年 4 月中旬',
    venue: '学生活动中心多功能厅',
    budget: '¥3,000–5,000',
  },
  sections: [
    {
      id: 'overview',
      title: '活动概览',
      summary:
        '面向全校学生的社团文化展示活动，包含互动体验、成果展览和主题分享。',
      items: [
        '目标：展示计算机协会年度成果，吸引新成员，促进社团间交流',
        '主题：「科技与人文」',
        '形式：14:00 互动展区开放，15:30 主题分享，17:00 自由交流',
      ],
    },
    ...LOCKED_PLACEHOLDER_SECTIONS,
  ] satisfies ResultSection[],
}

// ---------------------------------------------------------------------------
// View-data shape (normalised from API or demo)
// ---------------------------------------------------------------------------

interface TaskViewData {
  title: string
  type: string
  meta: { audience: string; date: string; venue: string; budget: string }
  previewSections: ResultSection[]
  fullSections: ResultSection[] | null
  unlocked: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function apiToView(data: any): TaskViewData {
  const audience =
    data.targetAudience ||
    (data.expectedParticipants ? `约 ${data.expectedParticipants} 人` : '待确认')

  return {
    title: data.activityName || '',
    type: MODE_LABELS[data.mode] || data.mode || '',
    meta: {
      audience,
      date: data.dateOrPeriod || '待确认',
      venue: data.location || '待确认',
      budget: data.budgetRange || '待确认',
    },
    previewSections: data.previewOutput || [],
    fullSections: data.fullOutput || null,
    unlocked: data.unlocked || false,
  }
}

function demoToView(): TaskViewData {
  return {
    title: demoResult.title,
    type: demoResult.type,
    meta: demoResult.meta,
    previewSections: demoResult.sections.filter((s) => FREE_SECTION_IDS.has(s.id)),
    fullSections: demoResult.sections,
    unlocked: true, // demo shows all content unlocked
  }
}

function buildMarkdown(
  title: string,
  type: string,
  meta: Record<string, string>,
  metaLabels: Record<string, string>,
  sections: ResultSection[],
): string {
  const lines: string[] = []
  lines.push(`# ${title}`)
  lines.push('')
  lines.push(`**类型：** ${type}`)
  lines.push('')
  for (const [key, label] of Object.entries(metaLabels)) {
    if (meta[key]) lines.push(`- **${label}：** ${meta[key]}`)
  }
  lines.push('')
  for (const section of sections) {
    lines.push(`## ${section.title}`)
    lines.push('')
    lines.push(section.summary)
    lines.push('')
    for (const item of section.items) lines.push(`- ${item}`)
    lines.push('')
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared result rendering (used by both demo and real task paths)
// ---------------------------------------------------------------------------

function TaskResultView({
  view,
  unlocked,
  isDemo,
  onRedeem,
  taskId,
}: {
  view: TaskViewData
  unlocked: boolean
  isDemo: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRedeem: (apiData: any) => void
  taskId: string
}) {
  const [copied, setCopied] = useState(false)

  const { title, type, meta } = view

  const metaItems = [
    { icon: Users, label: '面向', value: meta.audience },
    { icon: CalendarDays, label: '时间', value: meta.date },
    { icon: MapPin, label: '场地', value: meta.venue },
    { icon: Wallet, label: '预算', value: meta.budget },
  ]

  const metaLabels: Record<string, string> = {
    audience: '面向',
    date: '时间',
    venue: '场地',
    budget: '预算',
  }

  const allFullSections = view.fullSections
  const lockedSections = allFullSections
    ? allFullSections.filter((s) => !FREE_SECTION_IDS.has(s.id))
    : LOCKED_PLACEHOLDER_SECTIONS

  const sectionsForMarkdown = allFullSections || [
    ...view.previewSections,
    ...lockedSections,
  ]

  function handleCopyMarkdown() {
    const md = buildMarkdown(title, type, meta, metaLabels, sectionsForMarkdown)
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
      <Link
        href="/new"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              <Sparkles className="size-3" />
              {type}
            </span>
            <span className="text-xs text-muted-foreground">刚刚生成</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {unlocked && (
          <Button onClick={handleCopyMarkdown} variant="outline" size="sm">
            {copied ? (
              <>
                <Check className="size-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="size-4" />
                复制 Markdown
              </>
            )}
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metaItems.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <m.icon className="size-4" />
              <span className="text-xs">{m.label}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {view.previewSections.map((section) => (
            <SectionCard key={section.id} section={section} unlocked />
          ))}

          {lockedSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              unlocked={unlocked}
            />
          ))}

          {unlocked && (
            <div className="rounded-2xl border border-primary/30 bg-accent p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-accent-foreground">
                    全部内容已解锁
                  </p>
                  <p className="text-xs text-muted-foreground">
                    所有章节现在可以查看和复制。点击右上角「复制 Markdown」即可导出。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {isDemo ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-medium text-foreground">这是演示页面</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                真实生成的活动任务需要输入兑换码才能解锁完整内容。
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                <Link
                  href="/new"
                  className="font-medium text-primary hover:underline"
                >
                  创建一个真实任务
                </Link>
                {' '}体验完整流程。
              </p>
            </div>
          ) : (
            <RedeemPanel
              taskId={taskId}
              unlocked={unlocked}
              onUnlock={onRedeem}
              lockedDescriptions={LOCKED_SECTION_DESCRIPTIONS}
            />
          )}
        </aside>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PublicTaskResult — top-level controller
// ---------------------------------------------------------------------------

export function PublicTaskResult({ taskId }: { taskId: string }) {
  const [view, setView] = useState<TaskViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)

  // Called by RedeemPanel on successful code redemption.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleRedeem(apiData: any) {
    const v = apiToView(apiData)
    setView(v)
    setUnlocked(v.unlocked)
  }

  // Fetch task from API.
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setPageError(null)

      try {
        const res = await fetch(`/api/tasks/${taskId}`)

        if (res.status === 404) {
          if (!cancelled) {
            setPageError('任务不存在或链接已失效')
            setLoading(false)
          }
          return
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        if (cancelled) return

        const v = apiToView(data)
        setView(v)
        setUnlocked(v.unlocked)
      } catch {
        if (!cancelled) setPageError('加载失败，请稍后重试')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [taskId])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">加载中…</p>
      </div>
    )
  }

  if (pageError || !view) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-card">
          <AlertCircle className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">
          {pageError || '加载失败'}
        </p>
        <Link
          href="/new"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          返回新建任务
        </Link>
      </div>
    )
  }

  return (
    <TaskResultView
      view={view}
      unlocked={unlocked}
      isDemo={false}
      onRedeem={handleRedeem}
      taskId={taskId}
    />
  )
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

function SectionCard({
  section,
  unlocked,
}: {
  section: ResultSection
  unlocked: boolean
}) {
  // isAccessible = content should be shown (not blurred / not overlaid)
  const isAccessible = section.locked !== true || unlocked

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card',
        !isAccessible ? 'border-dashed border-border' : 'border-border',
      )}
    >
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
          {section.locked &&
            (unlocked ? (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Check className="size-3.5" />
                已解锁
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                已锁定
              </span>
            ))}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {section.summary}
        </p>
      </div>

      <div className="relative px-6 py-4">
        <ul
          className={cn(
            'space-y-2.5 transition',
            !isAccessible && 'pointer-events-none select-none blur-sm',
          )}
          aria-hidden={!isAccessible}
        >
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        {!isAccessible && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card/40">
            <div className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
              <Lock className="size-4" />
            </div>
            <p className="text-xs font-medium text-foreground">输入兑换码解锁</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Redeem panel (wired to real API)
// ---------------------------------------------------------------------------

function RedeemPanel({
  taskId,
  unlocked,
  onUnlock,
  lockedDescriptions,
}: {
  taskId: string
  unlocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUnlock: (data: any) => void
  lockedDescriptions: string[]
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setChecking(true)
    setError(null)

    try {
      const res = await fetch(`/api/tasks/${taskId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })

      if (res.status === 200) {
        const data = await res.json()
        onUnlock(data) // API response is the source of truth
      } else if (res.status === 404) {
        setError('兑换码无效，请检查后重试。')
        setChecking(false)
      } else if (res.status === 409) {
        setError('该兑换码已被使用。')
        setChecking(false)
      } else {
        const data = await res.json().catch(() => ({} as Record<string, unknown>))
        setError(
          (data.message as string) || (data.error as string) || '解锁失败，请稍后重试',
        )
        setChecking(false)
      }
    } catch {
      setError('网络错误，请检查连接后重试。')
      setChecking(false)
    }
  }

  if (unlocked) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">解锁后可获得</p>
        <ul className="mt-3 space-y-2">
          {lockedDescriptions.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          点击右上角「复制 Markdown」可导出完整文档。
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Lock className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">解锁完整内容</p>
          <p className="text-xs text-muted-foreground">
            预算、分工、流程表和检查清单需要解锁。
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="redeem-code-public" className="text-xs">
            兑换码
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="redeem-code-public"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              placeholder="输入兑换码"
              className="pl-9 font-mono uppercase tracking-wider"
              aria-invalid={!!error}
              aria-describedby={error ? 'redeem-error-public' : undefined}
            />
          </div>
          {error && (
            <p
              id="redeem-error-public"
              className="flex items-center gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={checking || !code.trim()}>
          {checking ? '验证中…' : '解锁'}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        还没有兑换码？{' '}
        <a href="#" className="font-medium text-primary hover:underline">
          了解升级方案
        </a>
      </p>
    </div>
  )
}
