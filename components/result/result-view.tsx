'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Lock,
  Check,
  Download,
  Share2,
  Sparkles,
  CalendarDays,
  Users,
  MapPin,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RedeemUnlock } from '@/components/result/redeem-unlock'
import { sampleResult, type ResultSection } from '@/lib/tasks'
import { cn } from '@/lib/utils'

export function ResultView() {
  const [unlocked, setUnlocked] = useState(false)
  const { title, type, meta, sections } = sampleResult

  const metaItems = [
    { icon: Users, label: 'Audience', value: meta.audience },
    { icon: CalendarDays, label: 'Date', value: meta.date },
    { icon: MapPin, label: 'Venue', value: meta.venue },
    { icon: Wallet, label: 'Budget', value: meta.budget },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              <Sparkles className="size-3" />
              {type}
            </span>
            <span className="text-xs text-muted-foreground">Generated just now</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!unlocked}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button size="sm" disabled={!unlocked}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
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
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} unlocked={unlocked} />
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <RedeemUnlock unlocked={unlocked} onUnlock={() => setUnlocked(true)} />
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">What you get</p>
            <ul className="mt-3 space-y-2">
              {['Full budget breakdown', 'Roles & responsibilities', 'Day-of run sheet', 'Pre-event checklist', 'Editable export (PDF & Docs)'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SectionCard({ section, unlocked }: { section: ResultSection; unlocked: boolean }) {
  const isLocked = section.locked && !unlocked

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card',
        isLocked ? 'border-dashed border-border' : 'border-border',
      )}
    >
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
          {section.locked &&
            (unlocked ? (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Check className="size-3.5" />
                Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Locked
              </span>
            ))}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.summary}</p>
      </div>

      <div className="relative px-6 py-4">
        <ul
          className={cn(
            'space-y-2.5 transition',
            isLocked && 'pointer-events-none select-none blur-sm',
          )}
          aria-hidden={isLocked}
        >
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card/40">
            <div className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
              <Lock className="size-4" />
            </div>
            <p className="text-xs font-medium text-foreground">Enter a code to unlock</p>
          </div>
        )}
      </div>
    </div>
  )
}
