import Link from 'next/link'
import { ArrowRight, Sparkles, FileText, CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-10%] mx-auto h-[420px] max-w-3xl rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-10 md:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            AI activity workflow assistant
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Plan, review, and hand off events in minutes
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            EventPilot turns a short brief into a complete event planning pack, reviews your
            documents, and generates clean handoff docs—so your team spends time on the event, not
            the paperwork.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard/new">
                Generate a planning pack
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free to start · No credit card · Built for student orgs &amp; small teams
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}

function HeroPreview() {
  const steps = [
    { icon: FileText, label: 'Planning pack', desc: 'Timeline, budget, roles, checklist' },
    { icon: CheckCircle2, label: 'Document review', desc: 'Flags gaps and risks' },
    { icon: Send, label: 'Handoff doc', desc: 'Clean summary to share' },
  ]
  return (
    <div className="relative mx-auto mt-14 max-w-5xl">
      <div className="rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            eventpilot.app/dashboard
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-background p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <s.icon className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{s.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
