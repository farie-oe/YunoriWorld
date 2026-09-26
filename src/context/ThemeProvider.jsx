import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeContext } from './ThemeContext'
import { DEFAULT_THEME_ID, THEMES } from '../lib/themes'
import { useAuth } from '../hooks/useAuth'
import { getProfile, updateProfileTheme } from '../services/profiles'

const STORAGE_KEY = 'youranime-theme'

// Kept in step with the transition-duration set on .ya-theme-transitioning
// in styles/themes.css.
const THEME_TRANSITION_MS = 900

function isValidTheme(id) {
  return THEMES.some((theme) => theme.id === id)
}

function readCachedTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isValidTheme(stored) ? stored : DEFAULT_THEME_ID
}

/**
 * Applies the active theme as CSS variables (via `data-theme`) and persists
 * the user's choice to profiles.theme in Supabase — the source of truth
 * once a user is authenticated. localStorage only caches the last-applied
 * theme so the correct look appears instantly before Supabase responds
 * (e.g. on first paint, or on the public login/register pages); it is
 * never allowed to override a value already loaded from Supabase.
 */
export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [themeId, setThemeIdState] = useState(readCachedTheme)
  const [themeError, setThemeError] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const root = document.documentElement
    let transitionTimer

    // Never fade in on the very first paint — only genuine subsequent
    // theme changes (a user's own pick, or the Supabase-loaded profile
    // theme replacing the cached guess) get the soft cross-fade.
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      root.classList.add('ya-theme-transitioning')
      setIsTransitioning(true)
      transitionTimer = setTimeout(() => {
        root.classList.remove('ya-theme-transitioning')
        setIsTransitioning(false)
      }, THEME_TRANSITION_MS)
    }

    root.setAttribute('data-theme', themeId)
    try {
      window.localStorage.setItem(STORAGE_KEY, themeId)
    } catch {
      // Ignore storage errors (e.g. private browsing) — Supabase remains
      // the persistent source of truth for authenticated users.
    }

    return () => clearTimeout(transitionTimer)
  }, [themeId])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getProfile(user.id)
      .then((profile) => {
        if (cancelled) return
        setThemeIdState(isValidTheme(profile?.theme) ? profile.theme : DEFAULT_THEME_ID)
      })
      .catch((err) => {
        console.error('Failed to load saved theme:', err)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const setThemeId = useCallback(
    async (nextThemeId) => {
      if (!isValidTheme(nextThemeId)) return

      setThemeIdState(nextThemeId)
      setThemeError('')

      if (!user) return

      try {
        await updateProfileTheme(user.id, nextThemeId)
      } catch (err) {
        console.error('Failed to save theme preference:', err)
        setThemeError('We could not save your theme choice. It will apply for now, but may not persist.')
      }
    },
    [user],
  )

  const activeTheme = THEMES.find((theme) => theme.id === themeId)

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        setThemeId,
        themes: THEMES,
        themeError,
        isTransitioning,
        transitionColor: activeTheme?.glow ?? null,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
