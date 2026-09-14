import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext'
import { DEFAULT_THEME_ID, THEMES } from '../lib/themes'

const STORAGE_KEY = 'youranime-theme'

function readStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return THEMES.some((theme) => theme.id === stored) ? stored : DEFAULT_THEME_ID
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(readStoredTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    window.localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}
