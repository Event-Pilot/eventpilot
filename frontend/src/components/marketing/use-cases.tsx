import { GraduationCap, PartyPopper, Briefcase, HeartHandshake, type LucideIcon } from 'lucide-react'
import { siteConfig } from '@/src/content/site'

const iconComponents: Record<string, LucideIcon> = {
  GraduationCap,
  PartyPopper,
  Briefcase,
  HeartHandshake,
}

const { label, heading, body, items } = siteConfig.useCases

export function UseCases() {
  return (
    <section id="use-cases" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="max-w-md">
          <p className="text-sm font-medium text-primary">{label}</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{body}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((c) => {
            const Icon = iconComponents[c.icon]
            return (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
