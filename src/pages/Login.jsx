import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { BRAND } from '../lib/brand'

function validate({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email is required.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function Login() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    setFormError('')

    const errors = validate(formValues)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email.trim(),
      password: formValues.password,
    })

    setIsSubmitting(false)

    if (error) {
      setFormError(
        error.status === 400
          ? 'Incorrect email or password. Please try again.'
          : error.message,
      )
      return
    }

    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to pick up your anime journey.">
      {formError && (
        <div className="ya-form-alert ya-form-alert--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`ya-field ${fieldErrors.email ? 'ya-field--invalid' : ''}`}>
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
            value={formValues.email}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          />
          {fieldErrors.email && (
            <p className="ya-field__error" id="login-email-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className={`ya-field ${fieldErrors.password ? 'ya-field--invalid' : ''}`}>
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
            value={formValues.password}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          />
          {fieldErrors.password && (
            <p className="ya-field__error" id="login-password-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="ya-auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="ya-form-footer ya-text-muted">
        New to {BRAND.name}?{' '}
        <Link to="/register" className="ya-form-link">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
