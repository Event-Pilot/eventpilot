import { SiteHeader } from '@/components/marketing/site-header'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { UseCases } from '@/components/marketing/use-cases'
import { CTA } from '@/components/marketing/cta'
import { SiteFooter } from '@/components/marketing/site-footer'
import { useLandingTheme } from '@/hooks/use-landing-theme'

export function HomePage() {
  const { theme, toggleTheme } = useLandingTheme()

  return (
    <div className="landing-theme flex min-h-screen flex-col" data-landing-theme={theme}>
      <SiteHeader variant="landing" landingTheme={theme} onLandingThemeToggle={toggleTheme} />
      <main className="w-full max-w-full flex-1 overflow-x-hidden">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <CTA />
      </main>
      <SiteFooter variant="landing" landingTheme={theme} />
    </div>
  )
}
