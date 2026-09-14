import { Heart } from 'lucide-react'
import { Blossom, Sparkle } from '../components/Decorative'
import './AuthLayout.css'

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="ya-auth-layout">
      <Blossom className="ya-auth-layout__blossom ya-auth-layout__blossom--top" />
      <Blossom className="ya-auth-layout__blossom ya-auth-layout__blossom--bottom" />

      <div className="ya-auth-layout__panel">
        <div className="ya-auth-layout__brand">
          <Heart size={26} className="ya-auth-layout__brand-icon" aria-hidden="true" />
          <span>YourAnime</span>
        </div>
        <p className="ya-text-muted ya-auth-layout__tagline">
          <Sparkle className="ya-auth-layout__tagline-sparkle" />
          Your anime. Your journey. Your way. &hearts;
        </p>

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
