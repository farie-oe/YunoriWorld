import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLoadingScreen from './AuthLoadingScreen'

/** Blocks access to nested routes unless a Supabase session exists. */
function ProtectedRoute() {
  const { session, loading, isRecovery, recoveryLinkFailed } = useAuth()

  if (loading) return <AuthLoadingScreen />

  if (recoveryLinkFailed) return <Navigate to="/reset-password" replace />

  if (session && isRecovery) return <Navigate to="/reset-password" replace />

  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute
