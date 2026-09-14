import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import Dashboard from './pages/Dashboard'
import MyAnime from './pages/MyAnime'
import WatchList from './pages/WatchList'
import Profile from './pages/Profile'
import Themes from './pages/Themes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/anime" element={<MyAnime />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/themes" element={<Themes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
