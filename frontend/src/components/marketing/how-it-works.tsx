import { siteConfig } from '@/src/content/site'

const { label, heading, body, routeLabel, steps } = siteConfig.howItWorks

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[var(--landing-bg)] px-4 py-20 text-[var(--landing-text)] sm:px-6 md:py-24"
    >
      <div
        aria-hidden="true"
        className="landing-ambient pointer-events-none absolute inset-0 opacity-70"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="max-w-lg">
            <p className="text-sm font-medium text-[var(--landing-accent)]">{label}</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--landing-heading)] sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-5 text-sm leading-6 text-[var(--landing-muted)]">{body}</p>
          </div>

          <div className="rounded-[1.75rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface-soft)] p-1.5 shadow-[var(--landing-shadow-card)]">
            <div className="rounded-[1.25rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--landing-border-soft)] pb-4">
                <p className="text-xs font-medium text-[var(--landing-subtle)]">{routeLabel}</p>
                <div className="h-px flex-1 bg-[var(--landing-accent)] opacity-25" />
              </div>

              <div className="mt-4 space-y-3">
                {steps.map((step, index) => (
                  <article
                    key={step.step}
                    className="group grid gap-4 rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] p-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[var(--landing-hover)] sm:grid-cols-[80px_1fr]"
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--landing-primary)] text-sm font-semibold text-[var(--landing-primary-text)]">
                        {step.step}
                      </span>
                      <span className="hidden sm:mt-3 sm:block sm:h-12 sm:w-px sm:bg-[var(--landing-accent)] sm:opacity-35" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--landing-heading)]">
                          {step.title}
                        </h3>
                        <span className="hidden h-1.5 w-24 rounded-full bg-[var(--landing-surface-strong)] sm:block">
                          <span
                            className={`block h-1.5 rounded-full bg-[var(--landing-accent)] ${
                              index === 0
                                ? 'w-[42%]'
                                : index === 1
                                  ? 'w-[64%]'
                                  : index === 2
                                    ? 'w-[82%]'
                                    : 'w-full'
                            }`}
                          />
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">{step.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
