import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { siteConfig } from '@/src/content/site'

const {
  badge,
  heading,
  body,
  primaryCta,
  secondaryCta,
  footnote,
  mock,
} = siteConfig.hero

const signalWidths = ['w-[78%]', 'w-[64%]', 'w-[86%]', 'w-[55%]', 'w-[70%]']
const outputTone = [
  'from-[#d9d4ff] to-[#8f86ff]',
  'from-[#ffe4c2] to-[#d8a767]',
  'from-[#cdeee3] to-[#6ab69c]',
  'from-[#d7e8ff] to-[#7ea5e8]',
]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <div
        aria-hidden="true"
        className="landing-ambient pointer-events-none absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="landing-grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-100"
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[color:var(--landing-border)] bg-[var(--landing-nav-bg)] px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-[var(--landing-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
            <Sparkles className="size-3.5 text-[var(--landing-accent)]" />
            {badge.text}
          </p>
          <h1 className="mx-auto mt-4 max-w-5xl text-balance text-[clamp(2.25rem,4vw,4.35rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--landing-heading)]">
            {heading}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-6 text-[var(--landing-muted)] sm:text-base sm:leading-7">
            {body}
          </p>
        </div>

        <HeroFlightDeck />

        <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-[1.35rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-2 shadow-[var(--landing-shadow-soft)] sm:flex-row">
          <p className="px-3 text-center text-xs leading-5 text-[var(--landing-subtle)] sm:text-left">{footnote}</p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href={primaryCta.href}
              className="group inline-flex h-11 items-center justify-center gap-3 rounded-2xl bg-[var(--landing-primary)] px-4 pl-5 text-sm font-semibold text-[var(--landing-primary-text)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[var(--landing-primary-hover)] active:scale-[0.98]"
            >
              {primaryCta.label}
              <span className="flex size-7 items-center justify-center rounded-xl bg-[var(--landing-primary-text)] text-[var(--landing-primary)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] px-5 text-sm font-medium text-[var(--landing-text)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[var(--landing-hover)] active:scale-[0.98]"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroFlightDeck() {
  return (
    <div className="relative mx-auto mt-7 max-w-[1080px] md:mt-8">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-8 h-20 w-[70%] -translate-x-1/2 rounded-full bg-[var(--landing-accent)] opacity-20 blur-3xl"
      />

      <div className="relative rounded-[1.65rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface-soft)] p-1.5 shadow-[var(--landing-shadow-stage)]">
        <div className="overflow-hidden rounded-[1.2rem] border border-[color:var(--landing-border)] bg-[var(--landing-panel)] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
          <div className="flex items-center justify-between border-b border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)] px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ff6b5f]/80" />
                <span className="size-2.5 rounded-full bg-[#f0c45c]/80" />
                <span className="size-2.5 rounded-full bg-[#75d294]/80" />
              </div>
              <p className="truncate text-xs font-medium text-[var(--landing-muted)]">{mock.windowLabel}</p>
            </div>
            <span className="hidden rounded-full border border-[color:var(--landing-border)] bg-[var(--landing-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--landing-accent-text)] sm:inline-flex">
              {mock.previewBadge}
            </span>
          </div>

          <div className="relative grid gap-0 lg:grid-cols-[245px_minmax(0,1fr)_275px]">
            <InputConsole />
            <AiOrchestrationCore />
            <OutputDossier />
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-4 max-w-3xl px-4 md:mt-5">
        <div className="rounded-[1.2rem] border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-1.5 shadow-[var(--landing-shadow-soft)]">
          <div className="grid gap-1.5 md:grid-cols-[116px_1fr] md:items-center">
            <p className="px-3 py-2 text-xs font-medium text-[var(--landing-subtle)]">{mock.routeLabel}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {mock.route.map((item, index) => (
                <div
                  key={item}
                  className="group relative overflow-hidden rounded-xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] px-3 py-2.5"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-[var(--landing-accent)] opacity-25" />
                  <p className="font-mono text-[10px] text-[var(--landing-accent)]">0{index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--landing-heading)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputConsole() {
  return (
    <aside className="border-b border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)] p-3 lg:border-b-0 lg:border-r">
      <div className="rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--landing-accent)]">{mock.inputTitle}</p>
            <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--landing-heading)]">
              {mock.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-[var(--landing-subtle)]">{mock.meta}</p>
          </div>
          <span className="rounded-xl border border-[color:var(--landing-border)] bg-[var(--landing-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--landing-accent-text)]">
            {mock.status}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {mock.inputRows.map((row) => (
            <div key={row.label} className="rounded-xl border border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)] px-3 py-2">
              <p className="text-[11px] text-[var(--landing-faint)]">{row.label}</p>
              <p className="mt-1 text-sm leading-5 text-[var(--landing-text)]">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-surface)] p-3">
        <p className="text-xs font-medium text-[var(--landing-muted)]">{mock.materialTitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {mock.materials.map((item) => (
            <span
              key={item}
              className="rounded-xl border border-[color:var(--landing-border)] bg-[var(--landing-panel-soft)] px-3 py-1.5 text-xs text-[var(--landing-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

function AiOrchestrationCore() {
  return (
    <section className="relative min-h-[310px] overflow-hidden bg-[var(--landing-bg-soft)] p-3 lg:min-h-[340px]">
      <div
        aria-hidden="true"
        className="landing-ambient absolute inset-0 opacity-90"
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-1/2 hidden h-px w-full bg-[var(--landing-accent)] opacity-25 lg:block"
      />

      <div className="relative flex h-full min-h-[284px] flex-col items-center justify-center">
        <div className="relative flex size-40 items-center justify-center rounded-full border border-[color:var(--landing-border)] bg-[var(--landing-surface)] shadow-[var(--landing-shadow-soft)] sm:size-48">
          <div className="absolute inset-5 rounded-full border border-[color:var(--landing-border-soft)]" />
          <div className="absolute inset-11 rounded-full border border-[color:var(--landing-border)] bg-[var(--landing-bg-soft)]" />
          <div className="relative z-10 max-w-36 text-center">
            <p className="font-mono text-[10px] tracking-[0.28em] text-[var(--landing-accent)]">AI</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--landing-heading)]">
              {mock.aiTitle}
            </h3>
            <p className="mt-2 text-xs leading-5 text-[var(--landing-subtle)]">{mock.aiSubtitle}</p>
          </div>
          <span className="absolute -left-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-[var(--landing-accent)] shadow-[0_0_24px_rgba(127,115,242,0.72)]" />
          <span className="absolute -right-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-[var(--landing-accent-2)] shadow-[0_0_24px_rgba(141,216,192,0.70)]" />
        </div>

        <div className="mt-5 grid w-full max-w-md grid-cols-5 gap-1.5">
          {mock.aiSignals.map((item, index) => (
            <div key={item} className="rounded-xl border border-[color:var(--landing-border-soft)] bg-[var(--landing-surface)] p-1.5">
              <p className="text-center text-[11px] text-[var(--landing-muted)]">{item}</p>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--landing-surface-strong)]">
                <div className={`h-1.5 rounded-full bg-[var(--landing-accent)] ${signalWidths[index]}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OutputDossier() {
  return (
    <aside className="border-t border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)] p-3 lg:border-l lg:border-t-0">
      <div className="rounded-2xl border border-[color:var(--landing-border)] bg-[var(--landing-surface-strong)] p-2 text-[var(--landing-text)] shadow-[var(--landing-shadow-soft)]">
        <div className="rounded-[1rem] border border-[color:var(--landing-border-soft)] bg-[var(--landing-surface)] p-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--landing-muted)]">{mock.outputTitle}</p>
              <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-[var(--landing-heading)]">{mock.deckTitle}</h2>
            </div>
            <span className="rounded-xl bg-[var(--landing-primary)] px-2.5 py-1 text-xs font-medium text-[var(--landing-primary-text)]">
              {mock.readyLabel}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {mock.outputs.map((item, index) => (
              <div key={item.title} className="rounded-xl border border-[color:var(--landing-border-soft)] bg-[var(--landing-panel-soft)] p-2">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b ${outputTone[index]}`} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--landing-heading)]">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--landing-muted)]">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {mock.summary.map((item) => (
              <div key={item.label} className="rounded-xl bg-[var(--landing-surface-strong)] px-2 py-2 text-center">
                <p className="font-mono text-sm font-semibold text-[var(--landing-accent-text)]">{item.value}</p>
                <p className="mt-1 text-[11px] text-[var(--landing-muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {mock.deckItems.map((item) => (
          <div key={item} className="rounded-xl border border-[color:var(--landing-border)] bg-[var(--landing-surface)] px-3 py-2">
            <p className="text-xs text-[var(--landing-muted)]">{item}</p>
          </div>
        ))}
      </div>
    </aside>
  )
}
