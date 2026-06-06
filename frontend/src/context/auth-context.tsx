'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  clearStoredAuthToken,
  getApiErrorMessage,
  getStoredAuthToken,
  setStoredAuthToken,
} from '@/services/api'
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from '@/services/auth'
import type {
  LoginRequest,
  RegisterRequest,
  User,
} from '@/types/auth'

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (input: LoginRequest) => Promise<void>
  register: (input: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredAuthToken())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    clearStoredAuthToken()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredAuthToken()
    if (!storedToken) {
      setToken(null)
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const currentUser = await getCurrentUser()
      setToken(storedToken)
      setUser(currentUser)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  useEffect(() => {
    function handleUnauthorized() {
      logout()
      setLoading(false)
    }

    window.addEventListener('eventpilot:auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('eventpilot:auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const login = useCallback(async (input: LoginRequest) => {
    try {
      const response = await loginRequest(input)
      setStoredAuthToken(response.token)
      setToken(response.token)
      setUser(response.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }, [])

  const register = useCallback(async (input: RegisterRequest) => {
    try {
      await registerRequest(input)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [loading, login, logout, refreshUser, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
