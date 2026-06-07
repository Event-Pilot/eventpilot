import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { uiCopy } from '@/content/ui-copy'
import { type ResultSection } from '@/types/tasks'

const resultCopy = uiCopy.publicPages.taskResult
const demoResult = resultCopy.demoResult

const demoSections: ResultSection[] = demoResult.sections.map((section) => ({
  ...section,
  items: [...section.items],
}))

export function StaticDemoTaskResult() {
  const metaItems = [
    {
      icon: Users,
      label: resultCopy.metaLabels.audience,
      value: demoResult.meta.audience,
    },
    {
      icon: CalendarDays,
      label: resultCopy.metaLabels.date,
      value: demoResult.meta.date,
    },
    {
      icon: MapPin,
      label: resultCopy.metaLabels.venue,
      value: demoResult.meta.venue,
    },
    {
      icon: Wallet,
      label: resultCopy.metaLabels.budget,
      value: demoResult.meta.budget,
    },
  ]

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
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#dfdcff] bg-[#f4f3ff] px-2.5 py-1 text-xs font-medium text-[#5146b7]">
            <Sparkles className="size-3.5" />
            {demoResult.type}
          </span>
          <span className="text-xs text-muted-foreground">{resultCopy.demoBadge}</span>
        </div>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {demoResult.title}
        </h1>

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
          {demoSections.map((section) => (
            <StaticSectionCard key={section.id} section={section} />
          ))}
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
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
        </aside>
      </div>
    </div>
  )
}

function StaticSectionCard({ section }: { section: ResultSection }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e1ded6] bg-white shadow-[0_14px_36px_rgba(36,32,24,0.04)]">
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
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f4f3ff] px-2 py-1 text-xs font-medium text-[#5146b7]">
            <Check className="size-3.5" />
            {resultCopy.sectionState.unlocked}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <ul className="space-y-2.5">
          {section.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5b4de8]" />
              <span className="leading-6">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
