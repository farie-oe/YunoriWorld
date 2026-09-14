import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'

function CreateAccount() {
  return (
    <AuthLayout title="Create your account" subtitle="Start organising the anime you love.">
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="ya-field">
          <label className="ya-field__label" htmlFor="register-username">
            Username
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            className="ya-input"
            placeholder="yourusername"
            autoComplete="username"
          />
        </div>

        <div className="ya-field">
          <label className="ya-field__label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            className="ya-input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="ya-field">
          <label className="ya-field__label" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            className="ya-input"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" variant="primary" className="ya-auth-submit">
          Create Account
        </Button>
      </form>

      <p className="ya-form-footer ya-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="ya-form-link">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default CreateAccount
