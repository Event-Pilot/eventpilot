'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import {
  FileStack,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Mode definitions
// ---------------------------------------------------------------------------

type TaskMode = 'startup' | 'review' | 'handoff'

const modes: { value: TaskMode; label: string; desc: string; icon: LucideIcon }[] = [
  {
    value: 'startup',
    label: '活动启动包',
    desc: '时间线、预算、分工、清单，拿来就能用',
    icon: FileStack,
  },
  {
    value: 'review',
    label: '活动复盘包',
    desc: '数据整理、问题标记、改进建议',
    icon: ShieldCheck,
  },
  {
    value: 'handoff',
    label: '换届交接包',
    desc: '流程文档、注意事项、一键移交',
    icon: Send,
  },
]

// ---------------------------------------------------------------------------
// Activity type options
// ---------------------------------------------------------------------------

const activityTypes = [
  '社团活动',
  '讲座',
  '比赛',
  '工作坊',
  '展览',
  '招新',
  '志愿服务',
  '晚会',
  '路演',
  '其他',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublicNewTaskForm() {
  const router = useRouter()
  const [mode, setMode] = useState<TaskMode>('startup')
  const [activityType, setActivityType] = useState('社团活动')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget as HTMLFormElement)

    const body = {
      mode,
      activityName: (formData.get('activityName') as string) ?? '',
      organizationName: (formData.get('organizationName') as string) ?? '',
      activityType,
      expectedParticipants: (formData.get('expectedParticipants') as string) ?? '',
      dateOrPeriod: (formData.get('dateOrPeriod') as string) ?? '',
      location: (formData.get('location') as string) ?? '',
      budgetRange: (formData.get('budgetRange') as string) ?? '',
      targetAudience: (formData.get('targetAudience') as string) ?? '',
      extraContext: (formData.get('extraContext') as string) ?? '',
      pastedMaterials: (formData.get('pastedMaterials') as string) ?? '',
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 201) {
        const data = await res.json()
        router.push(`/tasks/${data.id}`)
        // submitting stays true — page is navigating away
      } else {
        const data = await res.json().catch(() => ({} as Record<string, unknown>))
        setError(
          (data.message as string) ||
            (data.error as string) ||
            '创建失败，请稍后重试',
        )
        setSubmitting(false)
      }
    } catch {
      setError('网络错误，请检查连接后重试')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-20">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回首页
      </Link>

      {/* Heading */}
      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          新建活动任务
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          描述你的活动信息，EventPilot 会帮你整理成结构化流程文档。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* ---- Mode selector ------------------------------------------------ */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">生成模式</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {modes.map((m) => {
              const active = mode === m.value
              return (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    active
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <m.icon className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">{m.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {m.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* ---- Form fields -------------------------------------------------- */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          {/* Row 1: Activity name + Organization name */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activityName">活动名称</Label>
              <Input
                id="activityName"
                name="activityName"
                placeholder="例如：2026 春季社团文化节"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">组织名称</Label>
              <Input
                id="organizationName"
                name="organizationName"
                placeholder="例如：计算机协会"
                required
              />
            </div>
          </div>

          {/* Row 2: Activity type + Expected participants */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activityType">活动类型</Label>
              <Select name="activityType" value={activityType} onValueChange={setActivityType}>
                <SelectTrigger id="activityType">
                  <SelectValue placeholder="选择活动类型" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedParticipants">预计人数</Label>
              <Input
                id="expectedParticipants"
                name="expectedParticipants"
                type="number"
                placeholder="180"
                min={1}
              />
            </div>
          </div>

          {/* Row 3: Date/Period + Location */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOrPeriod">时间周期</Label>
              <Input
                id="dateOrPeriod"
                name="dateOrPeriod"
                placeholder="例如：2026 年 4 月中旬 或 第 8-10 周"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">地点</Label>
              <Input
                id="location"
                name="location"
                placeholder="例如：多功能厅 / 线上"
              />
            </div>
          </div>

          {/* Row 4: Budget + Target audience */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budgetRange">预算范围</Label>
              <Input
                id="budgetRange"
                name="budgetRange"
                placeholder="例如：¥3,000-5,000 或 待定"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">面向对象</Label>
              <Input
                id="targetAudience"
                name="targetAudience"
                placeholder="例如：全校学生 / 社团成员"
              />
            </div>
          </div>

          {/* Extra context */}
          <div className="space-y-2">
            <Label htmlFor="extraContext">其他背景</Label>
            <Textarea
              id="extraContext"
              name="extraContext"
              rows={3}
              placeholder="活动的目标、主题方向、特殊需求，或其他你认为重要的背景信息……"
            />
          </div>

          {/* Pasted materials */}
          <div className="space-y-2">
            <Label htmlFor="pastedMaterials">粘贴已有资料</Label>
            <Textarea
              id="pastedMaterials"
              name="pastedMaterials"
              rows={4}
              placeholder="如果有已有的策划草稿、会议记录、参考案例，可以直接粘贴到这里……"
            />
          </div>
        </div>

        {/* ---- Error -------------------------------------------------------- */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="size-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* ---- Actions ------------------------------------------------------ */}
        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="ghost">
            <Link href="/">取消</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Spinner className="size-4" />
                正在生成活动流程包…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                开始生成
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
