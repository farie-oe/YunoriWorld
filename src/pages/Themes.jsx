import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'
import { useTheme } from '../hooks/useTheme'
import { getBuiltInAvatar } from '../lib/avatars'
import './Themes.css'

function Themes() {
  const { themeId, setThemeId, themes, themeError } = useTheme()

  return (
    <div>
      <PageHeader title="Themes" description="Choose the atmosphere of your Yunori World." />

      {themeError && <p className="ya-form-alert ya-form-alert--error">{themeError}</p>}

      <div className="ya-themes__grid">
        {themes.map((theme) => {
          const isActive = theme.id === themeId
          const avatar = getBuiltInAvatar(theme.avatarId)

          return (
            <button
              key={theme.id}
              type="button"
              className={`ya-theme-option ${isActive ? 'ya-theme-option--active' : ''}`}
              onClick={() => setThemeId(theme.id)}
              aria-pressed={isActive}
            >
              <Avatar
                avatarType="builtin"
                avatarValue={theme.avatarId}
                size={84}
                className="ya-theme-option__avatar"
              />
              <span className="ya-theme-option__avatar-name">{avatar?.name}</span>
              <span className="ya-meta-text ya-theme-option__theme-name">{theme.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Themes
