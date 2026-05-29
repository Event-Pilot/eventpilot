import { FileStack, ShieldCheck, Send, Clock, Users, Wand2 } from 'lucide-react'

const features = [
  {
    icon: FileStack,
    title: 'Event planning packs',
    desc: 'Turn a one-line brief into a full pack: timeline, budget, roles, run-of-show, and checklists.',
  },
  {
    icon: ShieldCheck,
    title: 'Smart document review',
    desc: 'EventPilot reads your proposals and flags missing details, risks, and policy gaps before submission.',
  },
  {
    icon: Send,
    title: 'Clean handoff docs',
    desc: 'Generate a polished summary to hand off to the next committee, advisor, or venue.',
  },
  {
    icon: Clock,
    title: 'Minutes, not weekends',
    desc: 'Skip the blank page. Get a strong first draft instantly and refine the parts that matter.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    desc: 'Share tasks, assign owners, and keep everyone aligned on a single source of truth.',
  },
  {
    icon: Wand2,
    title: 'Templates that learn',
    desc: 'Reusable templates for socials, fundraisers, and conferences adapt to how your org works.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Everything in one workflow</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          From idea to handoff, without the busywork
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          EventPilot handles the repetitive parts of running activities so your team can focus on
          the experience.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
