'use client'

import { useState } from 'react'
import { Lock, Check, KeyRound, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Demo redeem codes — replace with server-side validation in production.
const VALID_CODES = ['EVENTPILOT', 'PILOT2026', 'UNLOCK']

export function RedeemUnlock({
  unlocked,
  onUnlock,
}: {
  unlocked: boolean
  onUnlock: () => void
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setChecking(true)
    setError(null)
    setTimeout(() => {
      if (VALID_CODES.includes(code.trim().toUpperCase())) {
        onUnlock()
      } else {
        setError('That code isn’t valid. Check it and try again.')
      }
      setChecking(false)
    }, 700)
  }

  if (unlocked) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-accent p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-foreground">Full output unlocked</p>
            <p className="text-xs text-muted-foreground">
              Every section is now available to view, edit, and export.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Lock className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Unlock the full pack</p>
          <p className="text-xs text-muted-foreground">
            Budget, roles, run sheet, and checklist are locked.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="redeem-code" className="text-xs">
            Redeem code
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="redeem-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              placeholder="Enter your code"
              className="pl-9 font-mono uppercase tracking-wider"
              aria-invalid={!!error}
              aria-describedby={error ? 'redeem-error' : undefined}
            />
          </div>
          {error && (
            <p id="redeem-error" className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={checking || !code.trim()}>
          {checking ? 'Checking…' : 'Unlock full output'}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        No code?{' '}
        <a href="#" className="font-medium text-primary hover:underline">
          Upgrade your plan
        </a>
      </p>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
        Try <span className="font-mono">EVENTPILOT</span> for the demo
      </p>
    </div>
  )
}
