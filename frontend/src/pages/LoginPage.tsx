import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uiCopy } from '@/content/ui-copy'
import { useAuth } from '@/context/auth-context'

type LoginLocationState = {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
  message?: string
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state = location.state as LoginLocationState | null
  const redirectTo = useMemo(() => {
    const from = state?.from
    if (!from?.pathname) return '/'
    return `${from.pathname}${from.search || ''}${from.hash || ''}`
  }, [state])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, redirectTo])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError(uiCopy.auth.login.validation.emailRequired)
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setError(uiCopy.auth.login.validation.emailInvalid)
      return
    }
    if (!password) {
      setError(uiCopy.auth.login.validation.passwordRequired)
      return
    }

    try {
      setSubmitting(true)
      await login({ email: trimmedEmail, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : uiCopy.auth.login.fallbackError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow={uiCopy.auth.login.eyebrow}
      title={uiCopy.auth.login.title}
      description={uiCopy.auth.login.description}
    >
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {state?.message && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {state.message}
          </div>
        )}

        {error && (
          <div className="flex gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="login-email">{uiCopy.auth.login.emailLabel}</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={uiCopy.auth.login.emailPlaceholder}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">{uiCopy.auth.login.passwordLabel}</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={uiCopy.auth.login.passwordPlaceholder}
            aria-invalid={!!error}
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {uiCopy.auth.login.submitting}
            </>
          ) : (
            <>
              {uiCopy.auth.login.submit}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {uiCopy.auth.login.newUserPrefix}{' '}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            {uiCopy.auth.login.registerLink}
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
