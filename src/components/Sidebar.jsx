import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Clapperboard, Bookmark, UserCircle, Palette, Heart, LogOut } from 'lucide-react'
import NavigationItem from './NavigationItem'
import Button from './Button'
import { useAuth } from '../hooks/useAuth'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/anime', label: 'My Anime', icon: Clapperboard },
  { to: '/watchlist', label: 'Watch List', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/themes', label: 'Themes', icon: Palette },
]

function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="ya-sidebar">
      <div className="ya-sidebar__brand">
        <Heart size={22} className="ya-sidebar__brand-icon" aria-hidden="true" />
        <span className="ya-sidebar__brand-name">YourAnime</span>
      </div>

      <nav className="ya-sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavigationItem key={item.to} {...item} />
        ))}
      </nav>

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
