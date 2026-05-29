const steps = [
  {
    step: '01',
    title: 'Describe your event',
    desc: 'Fill a short form—event type, audience, date, and goals. That is all EventPilot needs to start.',
  },
  {
    step: '02',
    title: 'Generate the pack',
    desc: 'Get a structured planning pack with timeline, budget, roles, and a ready-to-edit checklist.',
  },
  {
    step: '03',
    title: 'Review and refine',
    desc: 'EventPilot reviews attached docs, flags gaps, and suggests fixes you can accept in one click.',
  },
  {
    step: '04',
    title: 'Hand it off',
    desc: 'Export a clean handoff document to share with advisors, venues, or the next committee.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Four steps from brief to handoff
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
