import { useState } from 'react'
import Link from 'next/link'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uiCopy } from '@/content/ui-copy'
import { useAuth } from '@/context/auth-context'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUsername) {
      setError(uiCopy.auth.register.validation.usernameRequired)
      return
    }
    if (!trimmedEmail) {
      setError(uiCopy.auth.register.validation.emailRequired)
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setError(uiCopy.auth.register.validation.emailInvalid)
      return
    }
    if (password.length < 6) {
      setError(uiCopy.auth.register.validation.passwordTooShort)
      return
    }
    if (password !== confirmPassword) {
      setError(uiCopy.auth.register.validation.passwordMismatch)
      return
    }

    try {
      setSubmitting(true)
      await register({
        name: trimmedUsername,
        email: trimmedEmail,
        password,
      })
      navigate('/login', {
        replace: true,
        state: { message: uiCopy.auth.register.successMessage },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : uiCopy.auth.register.fallbackError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow={uiCopy.auth.register.eyebrow}
      title={uiCopy.auth.register.title}
      description={uiCopy.auth.register.description}
    >
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && (
          <div className="flex gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="register-username">{uiCopy.auth.register.usernameLabel}</Label>
          <Input
            id="register-username"
            autoComplete="name"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={uiCopy.auth.register.usernamePlaceholder}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">{uiCopy.auth.register.emailLabel}</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={uiCopy.auth.register.emailPlaceholder}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">{uiCopy.auth.register.passwordLabel}</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={uiCopy.auth.register.passwordPlaceholder}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-confirm-password">
            {uiCopy.auth.register.confirmPasswordLabel}
          </Label>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={uiCopy.auth.register.confirmPasswordPlaceholder}
            aria-invalid={!!error}
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {uiCopy.auth.register.submitting}
            </>
          ) : (
            <>
              {uiCopy.auth.register.submit}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {uiCopy.auth.register.existingUserPrefix}{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            {uiCopy.auth.register.loginLink}
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
