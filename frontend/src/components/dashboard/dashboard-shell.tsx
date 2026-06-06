'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FilePlus2, FileStack, Settings, LifeBuoy } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { uiCopy } from '@/content/ui-copy'
import { cn } from '@/lib/utils'

const nav = [
  { label: uiCopy.dashboard.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
  { label: uiCopy.dashboard.nav.newTask, href: '/dashboard/new', icon: FilePlus2 },
  { label: uiCopy.dashboard.nav.library, href: '/dashboard#library', icon: FileStack },
]

const secondary = [
  { label: uiCopy.dashboard.nav.settings, href: '/dashboard#settings', icon: Settings },
  { label: uiCopy.dashboard.nav.support, href: '/dashboard#support', icon: LifeBuoy },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" aria-label={uiCopy.common.homeAria}>
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="space-y-1 px-3 py-4">
          {secondary.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                MR
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {uiCopy.dashboard.sampleUser.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {uiCopy.dashboard.sampleUser.organization}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/" aria-label={uiCopy.common.homeAria}>
              <Logo />
            </Link>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">{uiCopy.dashboard.workspace}</p>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
