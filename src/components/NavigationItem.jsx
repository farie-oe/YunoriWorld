import { NavLink } from 'react-router-dom'
import './NavigationItem.css'

function NavigationItem({ to, label, iconSrc, tourId }) {
  return (
    <NavLink
      to={to}
      data-tour-id={tourId}
      className={({ isActive }) =>
        `ya-nav-item ${isActive ? 'ya-nav-item--active' : ''}`.trim()
      }
    >
      <img src={iconSrc} alt="" className="ya-nav-item__icon" />
      <span className="ya-nav-label ya-nav-item__label">{label}</span>
    </NavLink>
  )
}

export default NavigationItem
