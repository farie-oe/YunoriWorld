import { BRAND } from '../lib/brand'
import loginBackground from '../assets/backgrounds/login.jpg'
import createAccountBackground from '../assets/backgrounds/create-account.jpg'
import forgotPasswordBackground from '../assets/backgrounds/forgot-password.jpg'
import './AuthLayout.css'

// Each auth page has its own background. Forgot Password and Reset Password
// (no variant) share the forgot-password artwork.
const BACKGROUNDS = {
  login: loginBackground,
  register: createAccountBackground,
}

function AuthLayout({ title, subtitle, children, variant }) {
  const layoutClassName = ['ya-auth-layout', variant && `ya-auth-layout--${variant}`]
    .filter(Boolean)
    .join(' ')
  const background = BACKGROUNDS[variant] ?? forgotPasswordBackground

  return (
    <div className={layoutClassName} style={{ '--auth-bg': `url(${background})` }}>
      <span className="ya-auth-layout__wordmark">{BRAND.name}</span>

      <div className="ya-auth-layout__panel">
        <div className="ya-card ya-auth-layout__card">
          <h1 className="ya-section-heading ya-auth-layout__title">{title}</h1>
          {subtitle && <p className="ya-text-muted ya-auth-layout__subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
