import { SiteHeader } from '@/components/marketing/site-header'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { UseCases } from '@/components/marketing/use-cases'
import { CTA } from '@/components/marketing/cta'
import { SiteFooter } from '@/components/marketing/site-footer'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  )
}
