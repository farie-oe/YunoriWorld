import { useTheme } from '../hooks/useTheme'
import './ThemeTransitionOverlay.css'

/**
 * A single soft, one-shot glow — tinted with the incoming theme's colour —
 * that blooms and fades over the app shell whenever ThemeProvider reports
 * a theme change in progress. Purely decorative and non-interactive; the
 * actual colour cross-fade (background/border/text colours settling into
 * the new theme) is handled entirely by CSS in styles/themes.css. This
 * just adds the "atmosphere is shifting" touch on top of that.
 */
function ThemeTransitionOverlay() {
  const { isTransitioning, transitionColor } = useTheme()

  if (!isTransitioning || !transitionColor) return null

  return (
    <div
      className="ya-theme-transition-overlay"
      style={{ '--ya-transition-color': transitionColor }}
      aria-hidden="true"
    />
  )
}

export default ThemeTransitionOverlay
