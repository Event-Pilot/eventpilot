import { FileStack, ShieldCheck, Send, Clock, Users, Wand2, type LucideIcon } from 'lucide-react'
import { siteConfig } from '@/src/content/site'

const iconComponents: Record<string, LucideIcon> = {
  FileStack,
  ShieldCheck,
  Send,
  Clock,
  Users,
  Wand2,
}

const { label, heading, body, items } = siteConfig.features

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">{label}</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">{body}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => {
          const Icon = iconComponents[f.icon]
          return (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
