import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleAlert, MailCheck } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    setFormError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setFieldError('Email is required.')
      return
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFieldError('Enter a valid email address.')
      return
    }
    setFieldError('')

    setIsSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsSubmitting(false)

    // Always show the same success state whether or not the email is
    // registered, so this flow can't be used to discover account existence.
    if (error && error.status !== 400) {
      setFormError('Something went wrong. Please try again in a moment.')
      return
    }

    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <AuthLayout title="Check your inbox" subtitle="We've sent you a link to reset your password.">
        <div className="ya-form-alert ya-form-alert--success" role="status">
          <MailCheck size={20} aria-hidden="true" />
          <span>
            If an account exists for {email.trim()}, a password reset link is on its way. Follow
            the link to choose a new password.
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
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {formError && (
        <div className="ya-form-alert ya-form-alert--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`ya-field ${fieldError ? 'ya-field--invalid' : ''}`}>
          <label className="ya-field__label" htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            className="ya-input"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'forgot-email-error' : undefined}
          />
          {fieldError && (
            <p className="ya-field__error" id="forgot-email-error">
              {fieldError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="ya-auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending link...' : 'Send reset link'}
        </Button>
      </form>

      <p className="ya-form-footer ya-text-muted">
        Remembered your password?{' '}
        <Link to="/login" className="ya-form-link">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
