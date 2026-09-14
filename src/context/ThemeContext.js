import { createContext } from 'react'
import { DEFAULT_THEME_ID, THEMES } from '../lib/themes'

export const ThemeContext = createContext({
  themeId: DEFAULT_THEME_ID,
  setThemeId: () => {},
  themes: THEMES,
})
