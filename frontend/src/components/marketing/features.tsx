import { Clock, FileStack, Send, ShieldCheck, Users, Wand2, type LucideIcon } from 'lucide-react'
import { siteConfig } from '@/src/content/site'

const iconComponents: Record<string, LucideIcon> = {
  FileStack,
  ShieldCheck,
  Send,
  Clock,
  Users,
  Wand2,
}

const { label, heading, body, summary, preview, items } = siteConfig.features

export function Features() {
  return (
    <section
      id="features"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[var(--landing-bg)] px-4 py-20 text-[var(--landing-text)] sm:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="text-sm font-medium text-[var(--landing-accent)]">{label}</p>
          <h2 className="mt-3 max-w-xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--landing-heading)] sm:text-5xl">
            {heading}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[var(--landing-muted)]">{body}</p>

          <div className="mt-7 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-surface)] shadow-[var(--landing-shadow-soft)]">
            {summary.map((item) => (
              <div key={item.label} className="border-r border-[color:var(--landing-border-soft)] px-4 py-4 last:border-r-0">
                <p className="font-mono text-sm font-semibold text-[var(--landing-heading)]">{item.value}</p>
                <p className="mt-1 text-xs leading-4 text-[var(--landing-muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-flow-dense gap-3 sm:grid-cols-6">
          <ExecutionPackagePreview />
          {items.map((item, index) => {
            const Icon = iconComponents[item.icon]
            const spanClass =
              index < 3
                ? 'sm:col-span-2'
                : index === items.length - 1
                  ? 'sm:col-span-4'
                  : 'sm:col-span-3'

            return (
              <article
                key={item.title}
                className={`group rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-5 shadow-[var(--landing-shadow-soft)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--landing-shadow-card)] ${spanClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--landing-faint)]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-[-0.02em] text-[var(--landing-heading)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">{item.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ExecutionPackagePreview() {
  return (
    <article className="overflow-hidden rounded-[1.7rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface-soft)] p-1.5 text-[var(--landing-text)] shadow-[var(--landing-shadow-card)] sm:col-span-6">
      <div className="rounded-[1.25rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-medium text-[var(--landing-accent)]">{preview.title}</p>
            <h3 className="mt-2 max-w-sm text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--landing-heading)]">
              {preview.subtitle}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {preview.tabs.map((tab) => (
                <span
                  key={tab}
                  className="rounded-xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] px-3 py-1.5 text-xs text-[var(--landing-muted)]"
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] p-3">
            <div className="space-y-2">
              {preview.timeline.map((item, index) => (
                <div
                  key={item}
                  className="grid grid-cols-[28px_1fr] items-center gap-3 rounded-xl border border-[color:var(--landing-border-soft)] bg-[var(--landing-surface)] px-3 py-2.5"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--landing-accent-soft)] font-mono text-[11px] font-semibold text-[var(--landing-accent-text)]">
                    {index + 1}
                  </span>
                  <span className="text-sm text-[var(--landing-text)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
