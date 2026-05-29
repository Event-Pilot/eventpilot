import { GraduationCap, PartyPopper, Briefcase, HeartHandshake } from 'lucide-react'

const cases = [
  {
    icon: GraduationCap,
    title: 'Student organizations',
    desc: 'Run elections, info sessions, and recruitment drives with packs your whole exec team can follow.',
  },
  {
    icon: PartyPopper,
    title: 'Socials & mixers',
    desc: 'Plan socials end-to-end—venue, budget, promo timeline, and a day-of run sheet.',
  },
  {
    icon: HeartHandshake,
    title: 'Fundraisers',
    desc: 'Coordinate sponsors, set targets, and produce a clean report to hand to your treasurer.',
  },
  {
    icon: Briefcase,
    title: 'Small team events',
    desc: 'Offsites, launches, and workshops—drafted, reviewed, and ready to share in minutes.',
  },
]

export function UseCases() {
  return (
    <section id="use-cases" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="max-w-md">
          <p className="text-sm font-medium text-primary">Who it&apos;s for</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One assistant for every kind of activity
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Whether you run a 12-person club or a multi-track conference, EventPilot adapts to the
            scale and rhythm of your team.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <c.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
