import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { uiCopy } from '@/content/ui-copy'
import { useAuth } from '@/context/auth-context'

const LOGIN_REQUIRED_MESSAGE = uiCopy.auth.loginRequired

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="rounded-xl border border-border bg-card px-5 py-4 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {uiCopy.auth.checkingSession}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: LOGIN_REQUIRED_MESSAGE,
        }}
      />
    )
  }

  return <>{children}</>
}

export { LOGIN_REQUIRED_MESSAGE }
