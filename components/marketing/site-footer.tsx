import Link from 'next/link'
import { Logo } from '@/components/logo'

const columns = [
  {
    title: 'Product',
    links: ['Features', 'How it works', 'Templates', 'Pricing', 'Changelog'],
  },
  {
    title: 'Use cases',
    links: ['Student orgs', 'Clubs & societies', 'Small teams', 'Event committees'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Docs', 'Help center', 'Privacy', 'Terms'],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              The AI activity workflow assistant for student organizations and small teams.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EventPilot. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">Made for the teams that make things happen.</p>
        </div>
      </div>
    </footer>
  )
}
