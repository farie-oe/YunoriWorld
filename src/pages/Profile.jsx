import { useEffect, useState } from 'react'
import { UserCircle, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { getProfile, updateProfileUsername } from '../services/profiles'
import './Profile.css'

function formatDate(value) {
  if (!value) return 'Not set yet'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getProfile(user.id)
      .then((result) => {
        if (!cancelled) setProfile(result)
      })
      .catch((err) => {
        console.error('Failed to load profile:', err)
        if (!cancelled) setError('We could not load your profile right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const displayName = profile?.username || 'Setting up your profile...'
  const uniqueId = profile?.unique_id || '—————'

  function handleStartEditingUsername() {
    setUsernameInput(profile?.username || '')
    setUsernameError('')
    setIsEditingUsername(true)
  }

  function handleCancelEditingUsername() {
    setIsEditingUsername(false)
    setUsernameError('')
  }

  async function handleSaveUsername(event) {
    event.preventDefault()
    if (usernameSaving) return

    setUsernameSaving(true)
    setUsernameError('')

    try {
      const updated = await updateProfileUsername(user.id, usernameInput)
      setProfile(updated)
      setIsEditingUsername(false)
    } catch (err) {
      setUsernameError(err.message || 'We could not save your display name right now.')
    } finally {
      setUsernameSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your identity, at a glance." />

      <Card className="ya-profile__card">
        <div className="ya-profile__avatar" aria-hidden="true">
          <UserCircle size={40} strokeWidth={1.5} />
        </div>
        <div className="ya-profile__identity">
          <p className="ya-eyebrow ya-profile__eyebrow">Yunori Member</p>
          <h2 className="ya-page-title ya-profile__name">{displayName}</h2>
          <Badge tone="secondary">Yunori ID · {uniqueId}</Badge>
        </div>
      </Card>

      {error && <p className="ya-field__error">{error}</p>}

      {!error && !loading && !profile && (
        <p className="ya-text-muted">
          Your profile is still being set up. Try refreshing this page in a moment.
        </p>
      )}

      <Card className="ya-profile__info">
        <h3 className="ya-eyebrow ya-profile__info-title">Profile Information</h3>
        <dl className="ya-profile__info-grid">
          <div>
            <dt className="ya-label">Display name</dt>
            {isEditingUsername ? (
              <form className="ya-profile__username-form" onSubmit={handleSaveUsername}>
                <label htmlFor="profile-username" className="ya-visually-hidden">
                  Display name
                </label>
                <input
                  id="profile-username"
                  type="text"
                  className="ya-input"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  placeholder="How should we call you?"
                  autoFocus
                />
                {usernameError && <p className="ya-field__error">{usernameError}</p>}
                <div className="ya-profile__username-actions">
                  <Button type="submit" disabled={usernameSaving}>
                    {usernameSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEditingUsername}
                    disabled={usernameSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dd className="ya-body-text ya-profile__username-display">
                {profile?.username || 'Not set yet'}
                {profile && (
                  <Button
                    type="button"
                    variant="icon"
                    icon={Pencil}
                    onClick={handleStartEditingUsername}
                    aria-label="Edit display name"
                  />
                )}
              </dd>
            )}
          </div>
          <div>
            <dt className="ya-label">Email</dt>
            <dd className="ya-body-text">{user?.email || 'Not set yet'}</dd>
          </div>
          <div>
            <dt className="ya-label">Member since</dt>
            <dd className="ya-body-text">{formatDate(profile?.created_at)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}

export default Profile
