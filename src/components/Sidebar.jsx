import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import NavigationItem from './NavigationItem'
import Avatar from './Avatar'
import { Sparkle } from './Decorative'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { BRAND } from '../lib/brand'
import dashboardIcon from '../assets/ui/dashboard.png'
import myAnimeIcon from '../assets/ui/my-anime.png'
import watchListIcon from '../assets/ui/watch-list.png'
import profileIcon from '../assets/ui/profile.png'
import themesIcon from '../assets/ui/themes.png'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', iconSrc: dashboardIcon, tourId: 'nav-dashboard' },
  { to: '/anime', label: 'My Anime', iconSrc: myAnimeIcon, tourId: 'nav-anime' },
  { to: '/watchlist', label: 'Watch List', iconSrc: watchListIcon, tourId: 'nav-watchlist' },
  { to: '/profile', label: 'Profile', iconSrc: profileIcon },
  { to: '/themes', label: 'Themes', iconSrc: themesIcon, tourId: 'nav-themes' },
]

const [BRAND_FIRST_WORD, ...BRAND_REST_WORDS] = BRAND.name.split(' ')
const BRAND_REST = BRAND_REST_WORDS.join(' ')

function Sidebar() {
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="ya-sidebar">
      <Link to="/dashboard" className="ya-sidebar__brand" aria-label={BRAND.name}>
        <span className="ya-sidebar__brand-name">
          {BRAND_FIRST_WORD}
          {BRAND_REST && <span className="ya-sidebar__brand-name-rest">{BRAND_REST}</span>}
        </span>
        <Sparkle className="ya-sidebar__brand-sparkle" />
      </Link>

      <nav className="ya-sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavigationItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="ya-sidebar__spacer" />

      <Link
        to="/profile"
        className="ya-sidebar__profile"
        aria-label={profile?.username ? `${profile.username}'s profile` : 'Your profile'}
        title={profile?.username || 'Your profile'}
      >
        <Avatar
          avatarType={profile?.avatar_type}
          avatarValue={profile?.avatar_value}
          size={48}
          className="ya-sidebar__profile-avatar"
        />
      </Link>

      <button
        type="button"
        className="ya-sidebar__sign-out"
        onClick={handleSignOut}
        aria-label="Log out"
        title="Log out"
      >
        <LogOut size={22} aria-hidden="true" />
      </button>
    </aside>
  )
}

export default Sidebar
