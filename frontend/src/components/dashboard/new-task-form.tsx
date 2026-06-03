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
import { cn } from '@/lib/utils'

const taskTypes = [
  {
    value: 'pack',
    label: 'Planning pack',
    desc: 'Timeline, budget, roles & checklist',
    icon: FileStack,
  },
  {
    value: 'review',
    label: 'Document review',
    desc: 'Flag gaps, risks & policy issues',
    icon: ShieldCheck,
  },
  {
    value: 'handoff',
    label: 'Handoff doc',
    desc: 'Clean summary to share or pass on',
    icon: Send,
  },
]

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
        Back to dashboard
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">New task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your event and EventPilot will generate a draft you can refine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">What do you need?</legend>
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
            <Label htmlFor="title">Event name</Label>
            <Input id="title" name="title" placeholder="e.g. Spring Formal 2026" required />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-type">Event type</Label>
              <Select defaultValue="social">
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social / mixer</SelectItem>
                  <SelectItem value="fundraiser">Fundraiser</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Target date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="attendees">Expected attendees</Label>
              <Input id="attendees" name="attendees" type="number" placeholder="180" min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (optional)</Label>
              <Input id="budget" name="budget" placeholder="$6,500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals &amp; notes</Label>
            <Textarea
              id="goals"
              name="goals"
              rows={4}
              placeholder="Tell EventPilot what success looks like, any constraints, themes, or requirements..."
            />
          </div>
        </div>

        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="ghost">
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Spinner className="size-4" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
