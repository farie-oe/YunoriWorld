import { Orbit } from '../components/Decorative'
import { BRAND } from '../lib/brand'
import './AuthLayout.css'

const [BRAND_FIRST_WORD, ...BRAND_REST_WORDS] = BRAND.name.split(' ')
const BRAND_REST = BRAND_REST_WORDS.join(' ')

function AuthLayout({ title, subtitle, children, variant, hideBrand = false }) {
  const layoutClassName = ['ya-auth-layout', variant && `ya-auth-layout--${variant}`]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={layoutClassName}>
      <div className="ya-auth-layout__panel">
        {!hideBrand && (
          <div className="ya-auth-layout__brand-wrap">
            <div className="ya-auth-layout__brand">
              <Orbit className="ya-auth-layout__brand-mark" />
              <span className="ya-auth-layout__brand-name">
                {BRAND_FIRST_WORD}
                {BRAND_REST && <span className="ya-auth-layout__brand-name-rest">{BRAND_REST}</span>}
              </span>
              <span className="ya-auth-layout__brand-descriptor">{BRAND.descriptor}</span>
            </div>
            <p className="ya-auth-layout__tagline">{BRAND.tagline}</p>
          </div>
        )}

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
