import { useCallback, useEffect, useState } from 'react'

export type LandingTheme = 'light' | 'dark'

const STORAGE_KEY = 'eventpilot.landingTheme'

function readStoredTheme(): LandingTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function useLandingTheme() {
  const [theme, setTheme] = useState<LandingTheme>(readStoredTheme)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage may be unavailable in restricted browser contexts.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
