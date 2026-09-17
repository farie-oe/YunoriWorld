import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Clapperboard, Bookmark, UserCircle, Palette, LogOut, ChevronRight } from 'lucide-react'
import NavigationItem from './NavigationItem'
import Button from './Button'
import Avatar from './Avatar'
import { Orbit } from './Decorative'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profiles'
import { BRAND } from '../lib/brand'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/anime', label: 'My Anime', icon: Clapperboard },
  { to: '/watchlist', label: 'Watch List', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/themes', label: 'Themes', icon: Palette },
]

const [BRAND_FIRST_WORD, ...BRAND_REST_WORDS] = BRAND.name.split(' ')
const BRAND_REST = BRAND_REST_WORDS.join(' ')

function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getProfile(user.id)
      .then((result) => {
        if (!cancelled) setProfile(result)
      })
      .catch((err) => {
        console.error('Failed to load profile for sidebar:', err)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="ya-sidebar">
      <div className="ya-sidebar__brand">
        <Orbit className="ya-sidebar__brand-mark" />
        <div className="ya-sidebar__brand-lockup">
          <span className="ya-sidebar__brand-name">
            {BRAND_FIRST_WORD}
            {BRAND_REST && <span className="ya-sidebar__brand-name-rest">{BRAND_REST}</span>}
          </span>
          <span className="ya-sidebar__brand-tagline">{BRAND.tagline}</span>
        </div>
      </div>

      <div className="ya-sidebar__divider" role="presentation">
        <span />
        <Orbit className="ya-sidebar__divider-mark" />
        <span />
      </div>

      <nav className="ya-sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavigationItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="ya-sidebar__spacer" />

      <Link to="/profile" className="ya-sidebar__profile">
        <Avatar
          avatarType={profile?.avatar_type}
          avatarValue={profile?.avatar_value}
          size={36}
          className="ya-sidebar__profile-avatar"
        />
        <span className="ya-sidebar__profile-info">
          <span className="ya-sidebar__profile-name">{profile?.username || 'Your Profile'}</span>
          {profile?.unique_id && <span className="ya-sidebar__profile-id">{profile.unique_id}</span>}
        </span>
        <ChevronRight size={16} className="ya-sidebar__profile-chevron" aria-hidden="true" />
      </Link>

      <div className="ya-sidebar__footer">
        <Button
          variant="outline"
          icon={LogOut}
          onClick={handleSignOut}
          className="ya-sidebar__sign-out"
        >
          <span className="ya-sidebar__sign-out-label">Log Out</span>
        </Button>
      </div>
    </aside>
  )
}

export default Sidebar
