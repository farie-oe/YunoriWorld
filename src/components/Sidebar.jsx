import { LayoutDashboard, Clapperboard, Bookmark, UserCircle, Palette, Heart } from 'lucide-react'
import NavigationItem from './NavigationItem'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/anime', label: 'My Anime', icon: Clapperboard },
  { to: '/watchlist', label: 'Watch List', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/themes', label: 'Themes', icon: Palette },
]

function Sidebar() {
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
    </aside>
  )
}

export default Sidebar
