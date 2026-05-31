// ---------------------------------------------------------------------------
// EventPilot v0.1 — Static demo result page (no API calls, no state, no redeem)
// ---------------------------------------------------------------------------

import Link from 'next/link'
import {
  ArrowLeft,
  Lock,
  Check,
  Sparkles,
  CalendarDays,
  Users,
  MapPin,
  Wallet,
} from 'lucide-react'
import { type ResultSection } from '@/lib/tasks'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const FREE_SECTION_IDS = new Set(['overview'])

const demoSections: ResultSection[] = [
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
  },
]

// ---------------------------------------------------------------------------
// Component — pure static render, no hooks, no fetch, no state
// ---------------------------------------------------------------------------

export function StaticDemoTaskResult() {
  const title = '2026 春季社团文化节'
  const type = '活动启动包'
  const previewSections = demoSections.filter((s) =>
    FREE_SECTION_IDS.has(s.id),
  )
  const lockedSections = demoSections.filter(
    (s) => !FREE_SECTION_IDS.has(s.id),
  )

  const metaItems = [
    { icon: Users, label: '面向', value: '全校学生（约 180 人）' },
    { icon: CalendarDays, label: '时间', value: '2026 年 4 月中旬' },
    { icon: MapPin, label: '场地', value: '学生活动中心多功能厅' },
    { icon: Wallet, label: '预算', value: '¥3,000–5,000' },
  ]

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
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3" />
            {type}
          </span>
          <span className="text-xs text-muted-foreground">演示页面</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      {/* Meta cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metaItems.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <m.icon className="size-4" />
              <span className="text-xs">{m.label}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Sections — all visible, no blur, no unlock */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {previewSections.map((section) => (
            <StaticSectionCard key={section.id} section={section} />
          ))}
          {lockedSections.map((section) => (
            <StaticSectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Demo note instead of redeem panel */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">
              这是演示页面
            </p>
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
        </aside>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static section card — always visible, no lock state
// ---------------------------------------------------------------------------

function StaticSectionCard({ section }: { section: ResultSection }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          {section.title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {section.summary}
        </p>
      </div>

      <div className="px-6 py-4">
        <ul className="space-y-2.5">
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
