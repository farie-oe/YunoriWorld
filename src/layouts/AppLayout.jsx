import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ThemeTransitionOverlay from './ThemeTransitionOverlay'
import './AppLayout.css'

function AppLayout() {
  return (
    <div className="ya-app-layout">
      <ThemeTransitionOverlay />
      <Sidebar />
      <main className="ya-app-layout__main">
        <div className="ya-app-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
