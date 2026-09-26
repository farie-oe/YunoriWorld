import { createContext } from 'react'
import { DEFAULT_THEME_ID, THEMES } from '../lib/themes'

export const ThemeContext = createContext({
  themeId: DEFAULT_THEME_ID,
  setThemeId: () => {},
  themes: THEMES,
  themeError: '',
  // True for the brief window (see ThemeProvider's THEME_TRANSITION_MS)
  // right after the user picks a new theme, while colours are still
  // cross-fading; transitionColor is that incoming theme's glow colour,
  // for anything (e.g. ThemeTransitionOverlay) that wants to tint itself
  // to match.
  isTransitioning: false,
  transitionColor: null,
})
