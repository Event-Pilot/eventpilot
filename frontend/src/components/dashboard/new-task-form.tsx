'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileStack, ShieldCheck, Send, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
import { uiCopy } from '@/content/ui-copy'
import { cn } from '@/lib/utils'

const taskTypeIcons = [FileStack, ShieldCheck, Send]

const taskTypes = uiCopy.dashboard.newTaskForm.taskTypes.map((taskType, index) => ({
  ...taskType,
  icon: taskTypeIcons[index],
}))

export function NewTaskForm() {
  const router = useRouter()
  const [taskType, setTaskType] = useState('pack')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      router.push('/result/spring-formal')
    }, 1400)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {uiCopy.dashboard.newTaskForm.backToDashboard}
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {uiCopy.dashboard.newTaskForm.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {uiCopy.dashboard.newTaskForm.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            {uiCopy.dashboard.newTaskForm.modeLegend}
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {taskTypes.map((t) => {
              const active = taskType === t.value
              return (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTaskType(t.value)}
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
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                    )}
                  >
                    <t.icon className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">{t.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="title">{uiCopy.dashboard.newTaskForm.eventNameLabel}</Label>
            <Input
              id="title"
              name="title"
              placeholder={uiCopy.dashboard.newTaskForm.eventNamePlaceholder}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-type">{uiCopy.dashboard.newTaskForm.eventTypeLabel}</Label>
              <Select defaultValue="social">
                <SelectTrigger id="event-type">
                  <SelectValue placeholder={uiCopy.dashboard.newTaskForm.eventTypePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">
                    {uiCopy.dashboard.newTaskForm.eventTypeOptions.social}
                  </SelectItem>
                  <SelectItem value="fundraiser">
                    {uiCopy.dashboard.newTaskForm.eventTypeOptions.fundraiser}
                  </SelectItem>
                  <SelectItem value="conference">
                    {uiCopy.dashboard.newTaskForm.eventTypeOptions.conference}
                  </SelectItem>
                  <SelectItem value="workshop">
                    {uiCopy.dashboard.newTaskForm.eventTypeOptions.workshop}
                  </SelectItem>
                  <SelectItem value="meeting">
                    {uiCopy.dashboard.newTaskForm.eventTypeOptions.meeting}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">{uiCopy.dashboard.newTaskForm.targetDateLabel}</Label>
              <Input id="date" name="date" type="date" required />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="attendees">{uiCopy.dashboard.newTaskForm.attendeesLabel}</Label>
              <Input id="attendees" name="attendees" type="number" placeholder="180" min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">{uiCopy.dashboard.newTaskForm.budgetLabel}</Label>
              <Input
                id="budget"
                name="budget"
                placeholder={uiCopy.dashboard.newTaskForm.budgetPlaceholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">{uiCopy.dashboard.newTaskForm.goalsLabel}</Label>
            <Textarea
              id="goals"
              name="goals"
              rows={4}
              placeholder={uiCopy.dashboard.newTaskForm.goalsPlaceholder}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="ghost">
            <Link href="/dashboard">{uiCopy.dashboard.newTaskForm.cancel}</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Spinner className="size-4" />
                {uiCopy.dashboard.newTaskForm.generating}
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                {uiCopy.dashboard.newTaskForm.generate}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
