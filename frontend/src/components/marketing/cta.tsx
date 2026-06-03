import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/src/content/site'

const { heading, body, primaryCta, secondaryCta } = siteConfig.cta

export function CTA() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-48 max-w-xl rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
