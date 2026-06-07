import Link from 'next/link'
import { Logo } from '@/components/logo'
import { siteConfig } from '@/src/content/site'
import { cn } from '@/lib/utils'
import type { LandingTheme } from '@/hooks/use-landing-theme'

const { tagline, columns, copyright, bottom } = siteConfig.footer

export function SiteFooter({
  variant = 'default',
  landingTheme = 'light',
}: {
  variant?: 'default' | 'landing'
  landingTheme?: LandingTheme
}) {
  const landing = variant === 'landing'
  const landingDark = landing && landingTheme === 'dark'

  return (
    <footer
      className={cn(
        'border-t',
        landing
          ? 'border-[color:var(--landing-border)] bg-[var(--landing-bg)] text-[var(--landing-text)]'
          : 'border-[#e8e7e3] bg-[#f5f4f1]',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.35fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Logo variant={landingDark ? 'light' : 'default'} />
            <p
              className={cn(
                'max-w-xs text-sm leading-relaxed',
                landing ? 'text-[var(--landing-muted)]' : 'text-muted-foreground',
              )}
            >
              {tagline}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className={cn('text-sm font-semibold', landing ? 'text-[var(--landing-heading)]' : 'text-foreground')}>
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        'text-sm transition-colors',
                        landing
                          ? 'text-[var(--landing-subtle)] hover:text-[var(--landing-heading)]'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className={cn(
            'mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center',
            landing ? 'border-[color:var(--landing-border)]' : 'border-[#e1dfd8]',
          )}
        >
          <p className={cn('text-sm', landing ? 'text-[var(--landing-subtle)]' : 'text-muted-foreground')}>
            {copyright}
          </p>
          <p className={cn('text-sm', landing ? 'text-[var(--landing-subtle)]' : 'text-muted-foreground')}>
            {bottom}
          </p>
        </div>
      </div>
    </footer>
  )
}
