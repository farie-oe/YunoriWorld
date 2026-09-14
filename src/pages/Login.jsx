import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'

function Login() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to pick up your anime journey.">
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="ya-field">
          <label className="ya-field__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            className="ya-input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="ya-field">
          <label className="ya-field__label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="ya-input"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" variant="primary" className="ya-auth-submit">
          Log In
        </Button>
      </form>

      <p className="ya-form-footer ya-text-muted">
        New to YourAnime?{' '}
        <Link to="/register" className="ya-form-link">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
