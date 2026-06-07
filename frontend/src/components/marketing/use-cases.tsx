import { Briefcase, GraduationCap, HeartHandshake, PartyPopper, type LucideIcon } from 'lucide-react'
import { siteConfig } from '@/src/content/site'

const iconComponents: Record<string, LucideIcon> = {
  GraduationCap,
  PartyPopper,
  Briefcase,
  HeartHandshake,
}

const { label, heading, body, pipeline, highlightFlow, items } = siteConfig.useCases

export function UseCases() {
  return (
    <section
      id="use-cases"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[var(--landing-bg)] px-4 py-20 text-[var(--landing-text)] sm:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-[var(--landing-accent)]">{label}</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--landing-heading)] sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-5 text-sm leading-6 text-[var(--landing-muted)]">{body}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-2 shadow-[var(--landing-shadow-soft)]">
            <div className="grid grid-cols-3 overflow-hidden rounded-[1rem] border border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)]">
              {pipeline.map((item, index) => (
                <div key={item} className="border-r border-[color:var(--landing-border-soft)] px-4 py-3 last:border-r-0">
                  <p className="font-mono text-[11px] text-[var(--landing-accent)]">0{index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--landing-heading)]">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {highlightFlow.map((item) => (
                <div key={item} className="rounded-xl bg-[var(--landing-primary)] px-4 py-3 text-sm text-[var(--landing-primary-text)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {items.map((item, index) => {
            const Icon = iconComponents[item.icon]
            return (
              <article
                key={item.title}
                className={`group relative overflow-hidden rounded-[1.4rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-5 shadow-[var(--landing-shadow-soft)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--landing-shadow-card)] ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-[var(--landing-accent)] opacity-25" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--landing-faint)]">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em] text-[var(--landing-heading)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{item.desc}</p>
                {index === 0 && (
                  <div className="mt-8 rounded-2xl border border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)] p-4">
                    {highlightFlow.map((flowItem) => (
                      <div key={flowItem} className="flex items-center gap-3 border-b border-[color:var(--landing-border-soft)] py-2 last:border-b-0">
                        <span className="size-1.5 rounded-full bg-[var(--landing-accent)]" />
                        <span className="text-sm text-[var(--landing-muted)]">{flowItem}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
