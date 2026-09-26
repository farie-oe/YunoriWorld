import { Sparkle, Blossom } from './Decorative'
import './LoginTransition.css'

// Deterministic drift offsets/delays (no per-render randomness) — five
// sparkles and three cherry-blossom petals is deliberately few, so the
// scene stays calm rather than crowded.
const PARTICLES = [
  { type: 'sparkle', x: -120, y: -70, size: 16, delay: 0 },
  { type: 'sparkle', x: 100, y: -110, size: 12, delay: 0.12 },
  { type: 'sparkle', x: -70, y: 95, size: 10, delay: 0.28 },
  { type: 'sparkle', x: 130, y: 60, size: 14, delay: 0.18 },
  { type: 'sparkle', x: 10, y: -140, size: 10, delay: 0.35 },
  { type: 'petal', x: -150, y: 20, size: 20, delay: 0.05 },
  { type: 'petal', x: 150, y: -30, size: 18, delay: 0.22 },
  { type: 'petal', x: 40, y: 130, size: 18, delay: 0.4 },
]

/**
 * The short "entering Yunori" transition played after a successful login,
 * before Login.jsx navigates to the Dashboard: an expanding warm-white
 * glow plus a handful of sparkle/blossom-petal particles drifting out
 * from the centre, the screen fading toward white just as navigation
 * happens. Purely decorative (aria-hidden, pointer-events: none) — this
 * component only renders the visual; Login.jsx owns the actual timing and
 * only ever mounts it after a successful sign-in.
 */
function LoginTransition() {
  return (
    <div className="ya-login-transition" aria-hidden="true">
      <div className="ya-login-transition__glow" />
      <div className="ya-login-transition__particles">
        {PARTICLES.map((particle, i) => {
          const Shape = particle.type === 'sparkle' ? Sparkle : Blossom
          return (
            <span
              key={i}
              className={`ya-login-transition__particle ya-login-transition__particle--${particle.type}`}
              style={{
                '--ya-particle-x': `${particle.x}px`,
                '--ya-particle-y': `${particle.y}px`,
                width: particle.size,
                height: particle.size,
                animationDelay: `${particle.delay}s`,
              }}
            >
              <Shape className="ya-login-transition__particle-icon" />
            </span>
          )
        })}
      </div>
      <div className="ya-login-transition__fade" />
    </div>
  )
}

export default LoginTransition
