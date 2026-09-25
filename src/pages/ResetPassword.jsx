import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert, CircleCheck } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import AuthLoadingScreen from '../components/AuthLoadingScreen'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const MIN_PASSWORD_LENGTH = 8

function validate({ password, confirmPassword }) {
  const errors = {}

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

function ResetPassword() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [formValues, setFormValues] = useState({ password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

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

    const { error } = await supabase.auth.updateUser({ password: formValues.password })

    if (error) {
      setIsSubmitting(false)
      setFormError(error.message)
      return
    }

    await supabase.auth.signOut()
    setIsSubmitting(false)
    setIsDone(true)
  }

  if (loading) return <AuthLoadingScreen />

  if (isDone) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now log in with your new password.">
        <div className="ya-form-alert ya-form-alert--success" role="status">
          <CircleCheck size={20} aria-hidden="true" />
          <span>Your password has been reset successfully.</span>
        </div>

        <Button
          type="button"
          variant="primary"
          className="ya-auth-submit"
          onClick={() => navigate('/login', { replace: true })}
        >
          Go to log in
        </Button>
      </AuthLayout>
    )
  }

  if (!session) {
    return (
      <AuthLayout title="Link expired" subtitle="This password reset link is invalid or has expired.">
        <div className="ya-form-alert ya-form-alert--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>Please request a new password reset link and try again.</span>
        </div>

        <p className="ya-form-footer ya-text-muted">
          <Link to="/forgot-password" className="ya-form-link">
            Request a new link
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter and confirm your new password.">
      {formError && (
        <div className="ya-form-alert ya-form-alert--error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`ya-field ${fieldErrors.password ? 'ya-field--invalid' : ''}`}>
          <label className="ya-field__label" htmlFor="reset-password">
            New password
          </label>
          <input
            id="reset-password"
            name="password"
            type="password"
            className="ya-input"
            placeholder="••••••••"
            autoComplete="new-password"
            value={formValues.password}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'reset-password-error' : undefined}
          />
          {fieldErrors.password && (
            <p className="ya-field__error" id="reset-password-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className={`ya-field ${fieldErrors.confirmPassword ? 'ya-field--invalid' : ''}`}>
          <label className="ya-field__label" htmlFor="reset-confirm-password">
            Confirm new password
          </label>
          <input
            id="reset-confirm-password"
            name="confirmPassword"
            type="password"
            className="ya-input"
            placeholder="••••••••"
            autoComplete="new-password"
            value={formValues.confirmPassword}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? 'reset-confirm-password-error' : undefined
            }
          />
          {fieldErrors.confirmPassword && (
            <p className="ya-field__error" id="reset-confirm-password-error">
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
          {isSubmitting ? 'Updating password...' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
