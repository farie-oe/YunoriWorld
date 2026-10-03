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
    errors.username = 'Display name is required.'
  } else if (username.trim().length < MIN_USERNAME_LENGTH) {
    errors.username = `Display name must be at least ${MIN_USERNAME_LENGTH} characters.`
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
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)

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
        // Without this, Supabase falls back to the project's configured
        // Site URL for the confirmation link — computing it from the
        // actual origin (the same pattern ForgotPassword.jsx already uses
        // for its reset link) means it's correct on both localhost and
        // whatever domain the app is actually deployed to.
        emailRedirectTo: `${window.location.origin}/login`,
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

  const handleResend = async () => {
    if (isResending || !successState) return

    setIsResending(true)
    setResendMessage(null)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: successState.email,
      options: {
        // Same dynamic-origin redirect as the original signUp() call above
        // — this must stay in step with that fix rather than hardcoding
        // localhost or drifting from it.
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    setIsResending(false)

    if (error) {
      setResendMessage({ type: 'error', text: error.message })
      return
    }

    setResendMessage({ type: 'success', text: 'Verification email sent!' })
  }

  if (successState) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="You're almost ready to start your journey."
        variant="register"
      >
        <div className="ya-form-alert ya-form-alert--success" role="status">
          <MailCheck size={20} aria-hidden="true" />
          <span>
            {successState.needsEmailConfirmation
              ? `We've sent a confirmation link to ${successState.email}. Please confirm your email before logging in.`
              : `Your account for ${successState.email} has been created successfully.`}
          </span>
        </div>

        {successState.needsEmailConfirmation && (
          <div className="ya-auth-resend">
            <p className="ya-text-muted ya-auth-resend__prompt">Didn't receive the email?</p>
            <button
              type="button"
              className="ya-form-link ya-auth-resend__button"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
            {resendMessage && (
              <p
                className={
                  resendMessage.type === 'error'
                    ? 'ya-field__error ya-auth-resend__message'
                    : 'ya-auth-resend__message ya-auth-resend__message--success'
                }
                role={resendMessage.type === 'error' ? 'alert' : 'status'}
              >
                {resendMessage.text}
              </p>
            )}
          </div>
        )}

        <p className="ya-form-footer ya-text-muted">
          <Link to="/login" className="ya-form-link">
            Back to log in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organising the anime you love."
      variant="register"
    >
      {formError && (
        <div className="ya-form-alert ya-form-alert--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`ya-field ${fieldErrors.username ? 'ya-field--invalid' : ''}`}>
          <label className="ya-field__label" htmlFor="register-username">
            Display name
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            className="ya-input"
            placeholder="How should we call you?"
            autoComplete="nickname"
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
          className="ya-auth-submit ya-auth-submit--minimal"
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
