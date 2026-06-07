'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileStack,
  Send,
  ShieldCheck,
  Sparkles,
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
import { LOGIN_REQUIRED_MESSAGE } from '@/components/auth/route-guard'
import { useAuth } from '@/context/auth-context'
import { uiCopy } from '@/content/ui-copy'
import { cn } from '@/lib/utils'
import { createTask } from '@/services/tasks'

// ---------------------------------------------------------------------------
// Mode definitions
// ---------------------------------------------------------------------------

type TaskMode = 'startup' | 'review' | 'handoff'

const copy = uiCopy.publicPages.taskCreate
const fields = copy.fields

const modeIcons: Record<TaskMode, LucideIcon> = {
  startup: FileStack,
  review: ShieldCheck,
  handoff: Send,
}

const modes: { value: TaskMode; label: string; desc: string; icon: LucideIcon }[] =
  copy.modes.map((mode) => ({
    ...mode,
    value: mode.value as TaskMode,
    icon: modeIcons[mode.value as TaskMode],
  }))

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublicNewTaskForm() {
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [mode, setMode] = useState<TaskMode>('startup')
  const [activityType, setActivityType] = useState<string>(copy.activityTypes[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)

  /** Read a named input value from the container. */
  function getField(name: string): string {
    if (!containerRef.current) return ''
    const el = containerRef.current.querySelector(
      `[name="${name}"]`,
    ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    return el?.value ?? ''
  }

  async function handleGenerate(e: React.MouseEvent) {
    e.preventDefault()

    if (submitting) return

    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: {
          from: location,
          message: LOGIN_REQUIRED_MESSAGE,
        },
      })
      return
    }

    setError(null)
    setSubmitting(true)

    const activityName = getField('activityName').trim()
    const organizationName = getField('organizationName').trim()

    // Validate required fields in JS.
    if (!activityName) {
      setError(fields.activityName.requiredError)
      setSubmitting(false)
      return
    }
    if (!organizationName) {
      setError(fields.organizationName.requiredError)
      setSubmitting(false)
      return
    }

    const body = {
      mode,
      activityName,
      organizationName,
      activityType,
      expectedParticipants: getField('expectedParticipants'),
      dateOrPeriod: getField('dateOrPeriod'),
      location: getField('location'),
      budgetRange: getField('budgetRange'),
      targetAudience: getField('targetAudience'),
      extraContext: getField('extraContext'),
      pastedMaterials: getField('pastedMaterials'),
    }

    try {
      const data = await createTask(body)

      if (!data.id) {
        setError(copy.errors.missingResultLink)
        setSubmitting(false)
        return
      }

      setNavigating(true)
      // Brief delay so user sees "任务已创建" before navigation.
      setTimeout(() => {
        navigate(`/tasks/${data.id}`)
      }, 800)
    } catch (err) {
      const maybeResponse = err as {
        response?: { status?: number; data?: { message?: string; error?: string } }
      }

      if (maybeResponse.response?.status === 401) {
        logout()
        navigate('/login', {
          replace: true,
          state: {
            from: location,
            message: LOGIN_REQUIRED_MESSAGE,
          },
        })
        return
      }

      setError(
        maybeResponse.response?.data?.message ||
          maybeResponse.response?.data?.error ||
          copy.errors.network,
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {copy.backHome}
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section className="min-w-0">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#5b4de8]">{copy.eyebrow}</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.description}</p>
          </div>

          <div ref={containerRef} className="mt-6 space-y-5">
            <fieldset className="rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)]">
              <legend className="px-1 text-sm font-semibold text-foreground">
                {copy.modeLegend}
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {modes.map((m) => {
                  const active = mode === m.value
                  return (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-all',
                        active
                          ? 'border-[#5b4de8] bg-[#f4f3ff] shadow-[0_10px_28px_rgba(91,77,232,0.10)]'
                          : 'border-[#e6e3dc] bg-[#fbfbfa] hover:border-[#d7d3c8] hover:bg-white',
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg',
                          active
                            ? 'bg-[#5b4de8] text-white'
                            : 'bg-white text-muted-foreground ring-1 ring-[#e6e3dc]',
                        )}
                      >
                        <m.icon className="size-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {m.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="space-y-5 rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)] sm:p-6">
              <div className="flex flex-col gap-1 border-b border-[#ece9e1] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {copy.formTitle}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {copy.formDescription}
                  </p>
                </div>
                <span className="w-fit rounded-md border border-[#e8e5de] bg-[#fbfbfa] px-2 py-1 text-xs text-muted-foreground">
                  {copy.requiredHint}
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activityName">{fields.activityName.label}</Label>
                  <Input
                    id="activityName"
                    name="activityName"
                    placeholder={fields.activityName.placeholder}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">{fields.organizationName.label}</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    placeholder={fields.organizationName.placeholder}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activityType">{fields.activityType.label}</Label>
                  <Select name="activityType" value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger
                      id="activityType"
                      className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus:ring-[#5b4de8]/20"
                    >
                      <SelectValue placeholder={fields.activityType.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {copy.activityTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedParticipants">{fields.expectedParticipants.label}</Label>
                  <Input
                    id="expectedParticipants"
                    name="expectedParticipants"
                    type="number"
                    placeholder={fields.expectedParticipants.placeholder}
                    min={1}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOrPeriod">{fields.dateOrPeriod.label}</Label>
                  <Input
                    id="dateOrPeriod"
                    name="dateOrPeriod"
                    placeholder={fields.dateOrPeriod.placeholder}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{fields.location.label}</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder={fields.location.placeholder}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budgetRange">{fields.budgetRange.label}</Label>
                  <Input
                    id="budgetRange"
                    name="budgetRange"
                    placeholder={fields.budgetRange.placeholder}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">{fields.targetAudience.label}</Label>
                  <Input
                    id="targetAudience"
                    name="targetAudience"
                    placeholder={fields.targetAudience.placeholder}
                    className="h-10 rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraContext">{fields.extraContext.label}</Label>
                <Textarea
                  id="extraContext"
                  name="extraContext"
                  rows={3}
                  placeholder={fields.extraContext.placeholder}
                  className="rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastedMaterials">{fields.pastedMaterials.label}</Label>
                <Textarea
                  id="pastedMaterials"
                  name="pastedMaterials"
                  rows={4}
                  placeholder={fields.pastedMaterials.placeholder}
                  className="rounded-lg border-[#dedbd2] bg-[#fbfbfa] shadow-none focus-visible:ring-[#5b4de8]/20"
                />
              </div>
            </div>

            {submitting && (
              <div className="rounded-2xl border border-[#e1ded6] bg-white p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)]">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f3ff] text-[#5b4de8]">
                    <Spinner className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {navigating ? copy.loading.created : copy.loading.creating}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {copy.loading.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="text-sm leading-5 text-destructive">{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
              {submitting ? (
                <span className="text-sm text-muted-foreground">
                  {copy.loading.waiting}
                </span>
              ) : (
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  className="rounded-lg hover:bg-[#f0eee8]"
                >
                  <Link href="/">{copy.actions.cancel}</Link>
                </Button>
              )}
              <Button
                type="button"
                disabled={submitting}
                className="h-10 w-full rounded-lg bg-[#191815] px-5 text-white shadow-[0_14px_30px_rgba(25,24,21,0.13)] hover:bg-[#2b2924] sm:w-auto"
                onClick={handleGenerate}
              >
                {submitting ? (
                  <>
                    <Spinner className="size-4" />
                    {navigating ? copy.loading.redirecting : copy.loading.creating}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {copy.actions.submit}
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-[#e1ded6] bg-white/80 p-5 shadow-[0_16px_42px_rgba(36,32,24,0.05)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#f4f3ff] text-[#5b4de8]">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{copy.sidePanel.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {copy.sidePanel.description}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {copy.sidePanel.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-[#ece9e1] bg-[#fbfbfa] px-3 py-2"
                >
                  <span className="text-sm text-foreground">{item}</span>
                  <span className="size-1.5 rounded-full bg-[#5b4de8]" />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#e8e5de] bg-[#f7f6f2] p-4">
              <p className="text-xs font-semibold text-foreground">
                {copy.sidePanel.workflowTitle}
              </p>
              <div className="mt-3 space-y-3">
                {copy.sidePanel.workflow.map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white font-mono text-[11px] font-semibold text-[#5b4de8] ring-1 ring-[#e1ded6]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-xs leading-5 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
