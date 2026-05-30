'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ResultSection } from '@/lib/tasks'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Mock redeem codes (client-side only — no backend)
// ---------------------------------------------------------------------------

const VALID_CODES = ['EVENTPILOT', 'PILOT2026', 'UNLOCK']

// ---------------------------------------------------------------------------
// Chinese demo result — client-side mock, no backend
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
        '面向全校学生的社团文化展示活动，包含互动体验、成果展览和主题分享，旨在增进社团间交流和在校学生的参与感。',
      items: [
        '目标：展示计算机协会年度成果，吸引新成员，促进社团间交流',
        '主题：「科技与人文」',
        '形式：14:00 互动展区开放，15:30 主题分享，17:00 自由交流',
      ],
    },
    {
      id: 'timeline',
      title: '时间线 Checklist',
      summary: '八周筹备周期，按周拆分里程碑和负责人。',
      items: [
        '第 8 周：确认场地预定和押金',
        '第 6 周：确定参展社团名单和整体活动流程',
        '第 4 周：启动线上线下宣传、开放报名',
        '第 2 周：确认物资清单、设备和志愿者排班',
      ],
    },
    {
      id: 'budget',
      title: '预算项目清单',
      summary: '按项目列出预算明细，含缓冲金。',
      items: [
        '场地及设备租赁：¥1,200',
        '宣传物料（海报、横幅、传单）：¥600',
        '茶歇及活动物料：¥800',
        '应急预留（约 10%）：¥400',
      ],
      locked: true,
    },
    {
      id: 'roles',
      title: '人员分工建议',
      summary: '明确各岗位职责和备选联系人。',
      items: [
        '活动总负责人：统筹协调、对外联络、进度追踪',
        '宣传组：海报设计、推文撰写、线上线下推广',
        '物资组：物料采购、现场布置、设备调试',
        '接待组：签到引导、嘉宾接待、现场秩序维护',
      ],
      locked: true,
    },
    {
      id: 'schedule',
      title: '活动当天流程',
      summary: '活动日按分钟排布的执行时间表。',
      items: [
        '12:00 — 布置组到场，摆放展架、调试设备',
        '13:30 — 设备联调完成，签到台就位',
        '14:00 — 互动展区开放，观众入场',
        '15:30 — 主题分享环节开始',
        '17:00 — 自由交流、合影、发放纪念品',
        '17:30 — 撤场，物资清点归位',
      ],
      locked: true,
    },
    {
      id: 'checklist',
      title: '活动前 48 小时检查清单',
      summary: '最后 48 小时的确认清单，确保不遗漏。',
      items: [
        '与场地管理方确认使用时间和注意事项',
        '打印签到表、活动流程单和紧急联系人表',
        '检查投影、音响、话筒等设备是否正常',
        '向志愿者逐一确认到岗时间和分工',
        '准备应急物资包（备用转接头、打印纸、充电宝、胶带）',
      ],
      locked: true,
    },
  ] satisfies ResultSection[],
}

const FREE_SECTION_IDS = new Set(['overview'])
const LOCKED_SECTION_DESCRIPTIONS = [
  '时间线 Checklist、预算项目清单、人员分工建议',
  '活动当天流程、活动前 48 小时检查清单',
]

// ---------------------------------------------------------------------------
// Build Markdown from unlocked sections
// ---------------------------------------------------------------------------

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
    if (meta[key]) {
      lines.push(`- **${label}：** ${meta[key]}`)
    }
  }
  lines.push('')

  for (const section of sections) {
    lines.push(`## ${section.title}`)
    lines.push('')
    lines.push(section.summary)
    lines.push('')
    for (const item of section.items) {
      lines.push(`- ${item}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublicTaskResult() {
  const [unlocked, setUnlocked] = useState(false)
  const [copied, setCopied] = useState(false)

  const { title, type, meta, sections } = demoResult

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

  const freeSections = sections.filter((s) => FREE_SECTION_IDS.has(s.id))
  const lockedSections = sections.filter((s) => !FREE_SECTION_IDS.has(s.id))

  function handleCopyMarkdown() {
    const md = buildMarkdown(title, type, meta, metaLabels, sections)
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Back link */}
      <Link
        href="/new"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回
      </Link>

      {/* Title row */}
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

      {/* Meta cards */}
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

      {/* Sections */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-4">
          {/* Free preview sections */}
          {freeSections.map((section) => (
            <SectionCard key={section.id} section={section} unlocked />
          ))}

          {/* Locked sections */}
          {lockedSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              unlocked={unlocked}
            />
          ))}

          {/* Unlocked badge when all sections visible */}
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

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <RedeemPanel
            unlocked={unlocked}
            onUnlock={() => setUnlocked(true)}
            lockedDescriptions={LOCKED_SECTION_DESCRIPTIONS}
          />
        </aside>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section card (reuses visual pattern from result-view.tsx)
// ---------------------------------------------------------------------------

function SectionCard({
  section,
  unlocked,
}: {
  section: ResultSection
  unlocked: boolean
}) {
  const isLocked = section.locked !== true || unlocked

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card',
        !isLocked ? 'border-dashed border-border' : 'border-border',
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
            !isLocked && 'pointer-events-none select-none blur-sm',
          )}
          aria-hidden={!isLocked}
        >
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        {!isLocked && (
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
// Redeem panel (client-side mock)
// ---------------------------------------------------------------------------

function RedeemPanel({
  unlocked,
  onUnlock,
  lockedDescriptions,
}: {
  unlocked: boolean
  onUnlock: () => void
  lockedDescriptions: string[]
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setChecking(true)
    setError(null)
    setTimeout(() => {
      if (VALID_CODES.includes(code.trim().toUpperCase())) {
        onUnlock()
      } else {
        setError('兑换码无效，请检查后重试。')
      }
      setChecking(false)
    }, 700)
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
      <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
        演示码：<span className="font-mono">EVENTPILOT</span>
      </p>
    </div>
  )
}
