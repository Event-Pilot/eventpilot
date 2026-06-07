'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { uiCopy } from '@/content/ui-copy'
import { cn } from '@/lib/utils'
import { getTask, redeemTask } from '@/services/tasks'
import { type ResultSection, type TaskPublic } from '@/types/tasks'

const resultCopy = uiCopy.publicPages.taskResult
const MODE_LABELS = resultCopy.modeLabels as Record<string, string>
const META_LABELS = resultCopy.metaLabels as Record<string, string>
const FREE_SECTION_IDS = new Set(['overview'])

const LOCKED_PLACEHOLDER_SECTIONS: ResultSection[] =
  resultCopy.lockedPlaceholderSections.map((section) => ({
    ...section,
    items: [...section.items],
    locked: true,
  }))

const LOCKED_SECTION_DESCRIPTIONS = [...resultCopy.lockedDescriptions]

interface TaskViewData {
  title: string
  type: string
  meta: {
    audience: string
    date: string
    venue: string
    budget: string
  }
  previewSections: ResultSection[]
  fullSections: ResultSection[] | null
  unlocked: boolean
}

function apiToView(data: TaskPublic): TaskViewData {
  const fallback = resultCopy.fallbackMeta
  const audience =
    data.targetAudience ||
    (data.expectedParticipants
      ? `${fallback.participantsPrefix}${data.expectedParticipants}${fallback.participantsSuffix}`
      : fallback.unknown)

  return {
    title: data.activityName || resultCopy.state.untitledTask,
    type: MODE_LABELS[data.mode] || data.mode || resultCopy.state.untitledTask,
    meta: {
      audience,
      date: data.dateOrPeriod || fallback.unknown,
      venue: data.location || fallback.unknown,
      budget: data.budgetRange || fallback.unknown,
    },
    previewSections: data.previewOutput || [],
    fullSections: data.fullOutput || null,
    unlocked: data.unlocked || false,
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
  lines.push(`**${resultCopy.typeLabel}：** ${type}`)
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

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)

  try {
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    if (!ok) throw new Error('execCommand returned false')
  } finally {
    document.body.removeChild(textarea)
  }
}

export function PublicTaskResult({ taskId }: { taskId: string }) {
  const [view, setView] = useState<TaskViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)

  function handleRedeem(apiData: TaskPublic) {
    const nextView = apiToView(apiData)
    setView(nextView)
    setUnlocked(nextView.unlocked)
  }

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    async function load() {
      setLoading(true)
      setPageError(null)

      try {
        const data = await getTask(taskId)
        if (cancelled) return

        if (data.status === 'generating') {
          setGenerating(true)
          setLoading(false)
          timer = setTimeout(load, 5000)
          return
        }

        if (data.status === 'error') {
          setGenerating(false)
          setPageError(resultCopy.state.failedGeneration)
          setLoading(false)
          return
        }

        const nextView = apiToView(data)
        setView(nextView)
        setUnlocked(nextView.unlocked)
        setGenerating(false)
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status
        if (!cancelled) {
          setGenerating(false)
          setPageError(
            status === 404 ? resultCopy.state.notFound : resultCopy.state.loadFailed,
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [taskId])

  if (generating) {
    return <ResultLoadingState generating />
  }

  if (loading) {
    return <ResultLoadingState />
  }

  if (pageError || !view) {
    return <ResultErrorState message={pageError || resultCopy.state.fallbackFailed} />
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
  onRedeem: (apiData: TaskPublic) => void
  taskId: string
}) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const { title, type, meta } = view

  const allFullSections = view.fullSections
  const previewSections =
    view.previewSections.length > 0
      ? view.previewSections
      : allFullSections?.filter((section) => FREE_SECTION_IDS.has(section.id)) || []
  const lockedSections = allFullSections
    ? allFullSections.filter((section) => !FREE_SECTION_IDS.has(section.id))
    : LOCKED_PLACEHOLDER_SECTIONS
  const sectionsForMarkdown = allFullSections || [...previewSections, ...lockedSections]
  const hasSections = previewSections.length > 0 || lockedSections.length > 0

  const metaItems = [
    { icon: Users, label: resultCopy.metaLabels.audience, value: meta.audience },
    { icon: CalendarDays, label: resultCopy.metaLabels.date, value: meta.date },
    { icon: MapPin, label: resultCopy.metaLabels.venue, value: meta.venue },
    { icon: Wallet, label: resultCopy.metaLabels.budget, value: meta.budget },
  ]

  async function handleCopyMarkdown() {
    setCopyError(false)
    const markdown = buildMarkdown(title, type, meta, META_LABELS, sectionsForMarkdown)

    try {
      await copyToClipboard(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:pb-16">
      <Link
        href="/new"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {resultCopy.backCreate}
      </Link>

      <div className="mt-5 rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#dfdcff] bg-[#f4f3ff] px-2.5 py-1 text-xs font-medium text-[#5146b7]">
                <Sparkles className="size-3.5" />
                {type}
              </span>
              <span className="text-xs text-muted-foreground">
                {isDemo ? resultCopy.demoBadge : resultCopy.generatedJustNow}
              </span>
            </div>
            <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>

          {unlocked && (
            <div className="flex flex-col items-start gap-1.5 lg:items-end">
              <Button
                onClick={handleCopyMarkdown}
                variant="outline"
                size="sm"
                className="rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none hover:bg-white"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    {resultCopy.copied}
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    {resultCopy.copyMarkdown}
                  </>
                )}
              </Button>
              {copyError && (
                <p className="text-xs text-destructive">{resultCopy.copyError}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metaItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#e8e5de] bg-[#fbfbfa] p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="size-4" />
                <span className="text-xs">{item.label}</span>
              </div>
              <p className="mt-2 text-sm font-medium leading-5 text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section className="min-w-0 space-y-4">
          {!hasSections && <ResultEmptyState />}

          {previewSections.map((section) => (
            <SectionCard key={section.id} section={section} unlocked />
          ))}

          {lockedSections.map((section) => (
            <SectionCard key={section.id} section={section} unlocked={unlocked} />
          ))}

          {unlocked && hasSections && (
            <div className="rounded-2xl border border-[#d8d3ff] bg-[#f4f3ff] p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#5b4de8] text-white">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {resultCopy.allUnlockedTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {resultCopy.allUnlockedDescription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {isDemo ? (
            <DemoPanel />
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

function ResultLoadingState({ generating = false }: { generating?: boolean }) {
  const state = generating
    ? {
        title: resultCopy.state.generatingTitle,
        description: resultCopy.state.generatingDescription,
      }
    : {
        title: resultCopy.state.loadingTitle,
        description: resultCopy.state.loadingDescription,
      }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:pb-16">
      <div className="rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f3ff] text-[#5b4de8]">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{state.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {state.description}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl border border-[#e8e5de] bg-[#fbfbfa] p-4">
              <Skeleton className="h-3 w-16 bg-[#ece9e1]" />
              <Skeleton className="mt-3 h-4 w-28 bg-[#e6e2d8]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-2xl border border-[#e1ded6] bg-white p-5">
              <Skeleton className="h-4 w-40 bg-[#e6e2d8]" />
              <Skeleton className="mt-3 h-3 w-2/3 bg-[#ece9e1]" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-3 w-full bg-[#ece9e1]" />
                <Skeleton className="h-3 w-11/12 bg-[#ece9e1]" />
                <Skeleton className="h-3 w-4/5 bg-[#ece9e1]" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#e1ded6] bg-white p-5 lg:h-fit">
          <Skeleton className="h-4 w-32 bg-[#e6e2d8]" />
          <Skeleton className="mt-4 h-10 w-full bg-[#ece9e1]" />
          <Skeleton className="mt-3 h-9 w-full bg-[#e6e2d8]" />
        </div>
      </div>
    </div>
  )
}

function ResultErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-[#e1ded6] bg-white p-6 text-center shadow-[0_16px_42px_rgba(36,32,24,0.05)]">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">{message}</p>
        <Button
          asChild
          variant="outline"
          className="mt-5 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none hover:bg-white"
        >
          <Link href="/new">
            <ArrowLeft className="size-4" />
            {resultCopy.backCreate}
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ResultEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8d5cc] bg-white p-8 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#f4f3ff] text-[#5b4de8]">
        <FileText className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        {resultCopy.state.emptyTitle}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
        {resultCopy.state.emptyDescription}
      </p>
    </div>
  )
}

function SectionCard({
  section,
  unlocked,
}: {
  section: ResultSection
  unlocked: boolean
}) {
  const isAccessible = section.locked !== true || unlocked

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white shadow-[0_14px_36px_rgba(36,32,24,0.04)]',
        isAccessible ? 'border-[#e1ded6]' : 'border-dashed border-[#d8d5cc]',
      )}
    >
      <div className="border-b border-[#ece9e1] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {section.title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {section.summary}
            </p>
          </div>
          {section.locked &&
            (unlocked ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f4f3ff] px-2 py-1 text-xs font-medium text-[#5146b7]">
                <Check className="size-3.5" />
                {resultCopy.sectionState.unlocked}
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f1f0eb] px-2 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                {resultCopy.sectionState.locked}
              </span>
            ))}
        </div>
      </div>

      <div className="relative px-5 py-4 sm:px-6">
        <ul
          className={cn(
            'space-y-2.5 transition',
            !isAccessible && 'pointer-events-none select-none blur-sm',
          )}
          aria-hidden={!isAccessible}
        >
          {section.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5b4de8]" />
              <span className="leading-6">{item}</span>
            </li>
          ))}
        </ul>

        {!isAccessible && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/58 backdrop-blur-[1px]">
            <div className="flex size-9 items-center justify-center rounded-lg border border-[#e1ded6] bg-white text-muted-foreground shadow-sm">
              <Lock className="size-4" />
            </div>
            <p className="text-xs font-medium text-foreground">
              {resultCopy.sectionState.unlockHint}
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

function DemoPanel() {
  return (
    <div className="rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)]">
      <p className="text-sm font-semibold text-foreground">{resultCopy.demo.title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {resultCopy.demo.description}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        <Link href="/new" className="font-medium text-[#5b4de8] hover:underline">
          {resultCopy.demo.actionPrefix}
        </Link>
        {resultCopy.demo.actionSuffix}
      </p>
    </div>
  )
}

function RedeemPanel({
  taskId,
  unlocked,
  onUnlock,
  lockedDescriptions,
}: {
  taskId: string
  unlocked: boolean
  onUnlock: (data: TaskPublic) => void
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
      const data = await redeemTask(taskId, code.trim())
      onUnlock(data)
    } catch (error) {
      const response = (error as {
        response?: { status?: number; data?: { message?: string; error?: string } }
      }).response

      if (response?.status === 404) {
        setError(resultCopy.redeem.invalidCode)
      } else if (response?.status === 409) {
        setError(resultCopy.redeem.usedCode)
      } else {
        setError(
          response?.data?.message ||
            response?.data?.error ||
            resultCopy.redeem.failed,
        )
      }
    } finally {
      setChecking(false)
    }
  }

  if (unlocked) {
    return (
      <div className="rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)]">
        <p className="text-sm font-semibold text-foreground">
          {resultCopy.redeem.unlockedTitle}
        </p>
        <ul className="mt-3 space-y-2">
          {lockedDescriptions.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-[#5b4de8]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {resultCopy.redeem.exportHint}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f4f3ff] text-[#5b4de8]">
          <Lock className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{resultCopy.redeem.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {resultCopy.redeem.description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="redeem-code-public" className="text-xs">
            {resultCopy.redeem.codeLabel}
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="redeem-code-public"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                setError(null)
              }}
              placeholder={resultCopy.redeem.codePlaceholder}
              className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] pl-9 font-mono uppercase tracking-wider shadow-none focus-visible:ring-[#5b4de8]/20"
              aria-invalid={!!error}
              aria-describedby={error ? 'redeem-error-public' : undefined}
            />
          </div>
          {error && (
            <p
              id="redeem-error-public"
              className="flex items-center gap-1.5 text-xs leading-5 text-destructive"
            >
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full rounded-lg bg-[#191815] text-white shadow-none hover:bg-[#2b2924]"
          disabled={checking || !code.trim()}
        >
          {checking ? resultCopy.redeem.checking : resultCopy.redeem.submit}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {resultCopy.redeem.noCode}{' '}
        <Link href="/#pricing" className="font-medium text-[#5b4de8] hover:underline">
          {resultCopy.redeem.upgrade}
        </Link>
      </p>
    </div>
  )
}
