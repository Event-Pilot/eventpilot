import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@/src/content/site'

const { heading, body, highlights, primaryCta, secondaryCta } = siteConfig.cta

export function CTA() {
  return (
    <section
      id="pricing"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[var(--landing-bg)] px-4 py-20 text-[var(--landing-text)] sm:px-6 md:py-24"
    >
      <div
        aria-hidden="true"
        className="landing-ambient pointer-events-none absolute inset-0 opacity-60"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface-soft)] p-1.5 text-[var(--landing-text)] shadow-[var(--landing-shadow-stage)]">
          <div
            aria-hidden="true"
            className="landing-ambient pointer-events-none absolute inset-0 -z-10 opacity-80"
          />
          <div className="rounded-[1.55rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
              <div className="max-w-3xl">
                <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--landing-heading)] sm:text-5xl">
                  {heading}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--landing-muted)]">{body}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] px-3 py-1.5 text-xs text-[var(--landing-muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                <div className="grid gap-2">
                  {highlights.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-[var(--landing-surface)] px-4 py-3">
                      <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--landing-primary)] font-mono text-[11px] font-semibold text-[var(--landing-primary-text)]">
                        0{index + 1}
                      </span>
                      <span className="text-sm text-[var(--landing-muted)]">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Link
                    href={primaryCta.href}
                    className="group inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-[var(--landing-primary)] px-4 text-sm font-semibold text-[var(--landing-primary-text)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[var(--landing-primary-hover)] active:scale-[0.98]"
                  >
                    {primaryCta.label}
                    <span className="flex size-7 items-center justify-center rounded-xl bg-[var(--landing-primary-text)] text-[var(--landing-primary)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-surface)] px-4 text-sm font-medium text-[var(--landing-text)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[var(--landing-hover)] active:scale-[0.98]"
                  >
                    {secondaryCta.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
