import './AuthLoadingScreen.css'

/** Shown briefly while the Supabase session is being checked. */
function AuthLoadingScreen() {
  return (
    <div className="ya-auth-loading" role="status">
      <p className="ya-text-muted">Loading YourAnime...</p>
    </div>
  )
}

export default AuthLoadingScreen
