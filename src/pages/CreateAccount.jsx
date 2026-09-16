import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleAlert, MailCheck } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

const MIN_USERNAME_LENGTH = 3

function validate({ username, email, password, confirmPassword }) {
  const errors = {}

  if (!username.trim()) {
    errors.username = 'Username is required.'
  } else if (username.trim().length < MIN_USERNAME_LENGTH) {
    errors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters.`
  }

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function CreateAccount() {
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [successState, setSuccessState] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    setFormError('')
    setSuccessState(null)

    const errors = validate(formValues)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email: formValues.email.trim(),
      password: formValues.password,
      options: {
        data: {
          username: formValues.username.trim(),
        },
      },
    })

    setIsSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    const needsEmailConfirmation = Boolean(data.user) && !data.session

    setSuccessState({
      needsEmailConfirmation,
      email: formValues.email.trim(),
    })
    setFormValues({ username: '', email: '', password: '', confirmPassword: '' })
  }

  if (successState) {
    return (
      <AuthLayout title="Check your inbox" subtitle="You're almost ready to start your journey.">
        <div className="ya-form-alert ya-form-alert--success" role="status">
          <MailCheck size={20} aria-hidden="true" />
          <span>
            {successState.needsEmailConfirmation
              ? `We've sent a confirmation link to ${successState.email}. Please confirm your email before logging in.`
              : `Your account for ${successState.email} has been created successfully.`}
          </span>
        </div>

        <p className="ya-form-footer ya-text-muted">
          <Link to="/login" className="ya-form-link">
            Back to log in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start organising the anime you love.">
      {formError && (
        <div className="ya-form-alert ya-form-alert--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`ya-field ${fieldErrors.username ? 'ya-field--invalid' : ''}`}>
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
            value={formValues.username}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? 'register-username-error' : undefined}
          />
          {fieldErrors.username && (
            <p className="ya-field__error" id="register-username-error">
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div className={`ya-field ${fieldErrors.email ? 'ya-field--invalid' : ''}`}>
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
            value={formValues.email}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
          />
          {fieldErrors.email && (
            <p className="ya-field__error" id="register-email-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className={`ya-field ${fieldErrors.password ? 'ya-field--invalid' : ''}`}>
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
            value={formValues.password}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
          />
          {fieldErrors.password && (
            <p className="ya-field__error" id="register-password-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className={`ya-field ${fieldErrors.confirmPassword ? 'ya-field--invalid' : ''}`}>
          <label className="ya-field__label" htmlFor="register-confirm-password">
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            className="ya-input"
            placeholder="••••••••"
            autoComplete="new-password"
            value={formValues.confirmPassword}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined
            }
          />
          {fieldErrors.confirmPassword && (
            <p className="ya-field__error" id="register-confirm-password-error">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="ya-auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
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
