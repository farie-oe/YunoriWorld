import { Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { useTheme } from '../hooks/useTheme'
import './Themes.css'

function Themes() {
  const { themeId, setThemeId, themes, themeError } = useTheme()

  return (
    <div>
      <PageHeader
        title="Themes"
        description="Choose the look and feel of your YourAnime space. Themes only change presentation — your anime data stays exactly the same."
      />

      {themeError && <p className="ya-form-alert ya-form-alert--error">{themeError}</p>}

      <div className="ya-themes__grid">
        {themes.map((theme) => {
          const isActive = theme.id === themeId
          return (
            <Card
              key={theme.id}
              as="button"
              type="button"
              onClick={() => setThemeId(theme.id)}
              hoverable
              className={`ya-theme-card ${isActive ? 'ya-theme-card--active' : ''}`}
              aria-pressed={isActive}
            >
              <div className="ya-theme-card__swatches" aria-hidden="true">
                {theme.swatches.map((colour, index) => (
                  <span
                    key={index}
                    className="ya-theme-card__swatch"
                    style={{ background: colour }}
                  />
                ))}
              </div>

              <div className="ya-theme-card__body">
                <h3 className="ya-section-heading ya-theme-card__name">{theme.name}</h3>
                <p className="ya-text-muted ya-theme-card__description">{theme.description}</p>
              </div>

              {isActive && (
                <Badge tone="primary" className="ya-theme-card__badge">
                  <Check size={12} aria-hidden="true" /> Active
                </Badge>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default Themes
