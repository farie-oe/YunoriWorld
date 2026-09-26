import { NavLink } from 'react-router-dom'
import './NavigationItem.css'

function NavigationItem({ to, label, icon: Icon, tourId }) {
  return (
    <NavLink
      to={to}
      data-tour-id={tourId}
      className={({ isActive }) =>
        `ya-nav-item ${isActive ? 'ya-nav-item--active' : ''}`.trim()
      }
    >
      <Icon size={20} aria-hidden="true" />
      <span className="ya-nav-label ya-nav-item__label">{label}</span>
    </NavLink>
  )
}

export default NavigationItem
