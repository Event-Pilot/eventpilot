import { siteConfig } from '@/src/content/site'

const { label, heading, steps } = siteConfig.howItWorks

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{label}</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-sm font-medium text-primary">{s.step}</span>
              <h3 className="mt-3 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
