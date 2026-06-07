'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo } from '@/components/logo'
import { uiCopy } from '@/content/ui-copy'
import { useAuth } from '@/context/auth-context'
import { siteConfig } from '@/src/content/site'
import { cn } from '@/lib/utils'
import type { LandingTheme } from '@/hooks/use-landing-theme'

const { navItems } = siteConfig.header
type SiteHeaderVariant = 'default' | 'landing'

interface SiteHeaderProps {
  variant?: SiteHeaderVariant
  landingTheme?: LandingTheme
  onLandingThemeToggle?: () => void
}

function resolveNavHref(href: string) {
  return href.startsWith('#') ? `/${href}` : href
}

function getUserInitials(name: string | null | undefined, email: string | undefined) {
  const source = (name || email || uiCopy.common.userFallback).trim()
  return source.slice(0, 2).toUpperCase()
}

export function SiteHeader({
  variant = 'default',
  landingTheme = 'light',
  onLandingThemeToggle,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const landing = variant === 'landing'
  const landingDark = landing && landingTheme === 'dark'

  function handleLogout() {
    logout()
    setOpen(false)
  }

  const userInitials = getUserInitials(user?.name, user?.email)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 backdrop-blur-xl',
        landing
          ? 'border-b border-[color:var(--landing-header-border)] bg-[var(--landing-header-bg)] text-[var(--landing-text)]'
          : 'border-b border-[#e8e7e3] bg-[#fbfbfa]/88',
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={uiCopy.common.homeAria}>
          <Logo variant={landingDark ? 'light' : 'default'} />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <nav
            className={cn(
              'items-center rounded-xl border p-0.5 md:flex',
              landing
                ? 'border-[color:var(--landing-nav-border)] bg-[var(--landing-nav-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-transparent bg-white/45',
            )}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={resolveNavHref(item.href)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  landing
                    ? 'text-[var(--landing-muted)] hover:bg-[var(--landing-hover)] hover:text-[var(--landing-heading)]'
                    : 'text-muted-foreground hover:bg-[#f1f0ed] hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {landing && onLandingThemeToggle ? (
            <LandingThemeButton
              theme={landingTheme}
              onClick={onLandingThemeToggle}
            />
          ) : null}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-medium shadow-[0_10px_26px_rgba(36,32,24,0.05)] transition-colors',
                    landing
                      ? 'border-[color:var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] hover:bg-[var(--landing-panel-soft)]'
                      : 'border-[#e6e4df] bg-white/80 text-foreground hover:bg-white',
                  )}
                  aria-label={uiCopy.navigation.openUserMenu}
                >
                  <Avatar className="size-7 rounded-lg">
                    <AvatarFallback
                      className={cn(
                        'rounded-lg text-[11px] font-semibold',
                        landing
                          ? 'bg-[var(--landing-primary)] text-[var(--landing-primary-text)]'
                          : 'bg-foreground text-background',
                      )}
                    >
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate">{user.name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate">
                    {user.name || uiCopy.common.userFallback}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    {uiCopy.navigation.dashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/new">
                    <FilePlus2 className="size-4" />
                    {uiCopy.navigation.newTask}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  {uiCopy.navigation.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  landing
                    ? 'text-[var(--landing-muted)] hover:bg-[var(--landing-hover)] hover:text-[var(--landing-heading)]'
                    : 'hover:bg-[#f1f0ed]',
                )}
              >
                <Link href="/login">{uiCopy.navigation.login}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className={cn(
                  landing
                    ? 'bg-[var(--landing-primary)] text-[var(--landing-primary-text)] shadow-[var(--landing-shadow-soft)] hover:bg-[var(--landing-primary-hover)]'
                    : 'bg-[#191815] text-white shadow-[0_10px_24px_rgba(25,24,21,0.12)] hover:bg-[#2b2924]',
                )}
              >
                <Link href="/register">{uiCopy.navigation.register}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {landing && onLandingThemeToggle ? (
            <LandingThemeButton
              theme={landingTheme}
              onClick={onLandingThemeToggle}
            />
          ) : null}
          <button
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-md transition-colors',
              landing
                ? 'text-[var(--landing-heading)] hover:bg-[var(--landing-hover)]'
                : 'text-foreground hover:bg-[#f1f0ed]',
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={uiCopy.navigation.toggleMenu}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t md:hidden',
          landing
            ? 'border-[color:var(--landing-border)] bg-[var(--landing-bg)]'
            : 'border-border/70',
          open ? 'max-h-80' : 'max-h-0 border-t-0',
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={resolveNavHref(item.href)}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded-md px-3 py-2 text-sm',
                landing
                  ? 'text-[var(--landing-muted)] hover:bg-[var(--landing-hover)] hover:text-[var(--landing-heading)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-foreground text-xs font-semibold text-background">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name || uiCopy.common.userFallback}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      {uiCopy.navigation.dashboard}
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/new" onClick={() => setOpen(false)}>
                      {uiCopy.navigation.newTask}
                    </Link>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
                    {uiCopy.navigation.logout}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(
                    landing &&
                      'border-[color:var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] hover:bg-[var(--landing-hover)] hover:text-[var(--landing-heading)]',
                  )}
                >
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {uiCopy.navigation.login}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    landing &&
                      'bg-[var(--landing-primary)] text-[var(--landing-primary-text)] hover:bg-[var(--landing-primary-hover)]',
                  )}
                >
                  <Link href="/register" onClick={() => setOpen(false)}>
                    {uiCopy.navigation.register}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function LandingThemeButton({
  theme,
  onClick,
}: {
  theme: LandingTheme
  onClick: () => void
}) {
  const switchingToLight = theme === 'dark'
  const label = switchingToLight
    ? uiCopy.navigation.switchToLightTheme
    : uiCopy.navigation.switchToDarkTheme
  const Icon = switchingToLight ? Sun : Moon

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-xl border border-[color:var(--landing-nav-border)] bg-[var(--landing-nav-bg)] text-[var(--landing-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[var(--landing-hover)] hover:text-[var(--landing-heading)] active:scale-[0.98]"
    >
      <Icon className="size-4" />
    </button>
  )
}
