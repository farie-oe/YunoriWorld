import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLoadingScreen from './AuthLoadingScreen'

/** Keeps already-authenticated users off the login/register pages. */
function PublicOnlyRoute() {
  const { session, loading, holdPublicRedirect } = useAuth()

  if (loading) return <AuthLoadingScreen />

  if (session && !holdPublicRedirect) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default PublicOnlyRoute
