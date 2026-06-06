'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
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

const { navItems } = siteConfig.header

function getUserInitials(name: string | null | undefined, email: string | undefined) {
  const source = (name || email || uiCopy.common.userFallback).trim()
  return source.slice(0, 2).toUpperCase()
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  function handleLogout() {
    logout()
    setOpen(false)
  }

  const userInitials = getUserInitials(user?.name, user?.email)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label={uiCopy.common.homeAria}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-2.5 py-1.5 text-sm font-medium text-foreground shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition-colors hover:bg-muted/50"
                  aria-label={uiCopy.navigation.openUserMenu}
                >
                  <Avatar className="size-7 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-foreground text-[11px] font-semibold text-background">
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
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{uiCopy.navigation.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{uiCopy.navigation.register}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={uiCopy.navigation.toggleMenu}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-border/70 md:hidden',
          open ? 'max-h-80' : 'max-h-0 border-t-0',
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
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
                <Button asChild variant="outline" size="sm">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {uiCopy.navigation.login}
                  </Link>
                </Button>
                <Button asChild size="sm">
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
