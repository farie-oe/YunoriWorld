import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import AvatarPickerModal from '../components/AvatarPickerModal'
import DeleteAccountModal from '../components/DeleteAccountModal'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { updateProfileUsername } from '../services/profiles'
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
  const { user, signOut } = useAuth()
  const { profile, loading, setProfile } = useProfile()
  const navigate = useNavigate()

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

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

  function handleAvatarSaved(updatedProfile) {
    setProfile(updatedProfile)
    setIsAvatarPickerOpen(false)
  }

  async function handleAccountDeleted() {
    setIsDeleteAccountOpen(false)
    try {
      await signOut()
    } catch (err) {
      // The account (and its session) is already gone server-side at this
      // point — ignore a failed remote sign-out and clear the client
      // forward regardless, so the user always ends up back at Login.
      console.error('Sign-out after account deletion failed:', err)
    }
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your identity, at a glance." />

      <Card className="ya-profile__card">
        <div className="ya-profile__avatar-wrap">
          <Avatar avatarType={profile?.avatar_type} avatarValue={profile?.avatar_value} size={80} />
          <button
            type="button"
            className="ya-profile__avatar-edit"
            onClick={() => setIsAvatarPickerOpen(true)}
            aria-label="Change avatar"
          >
            <Pencil size={13} />
          </button>
        </div>
        <div className="ya-profile__identity">
          <p className="ya-eyebrow ya-profile__eyebrow">Yunori Member</p>
          <h2 className="ya-page-title ya-profile__name">{displayName}</h2>
          <Badge tone="secondary">Yunori ID · {uniqueId}</Badge>
        </div>
      </Card>

      {!loading && !profile && (
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

      <Card className="ya-profile__danger-zone">
        <p className="ya-eyebrow ya-profile__danger-zone-label">Danger Zone</p>
        <div className="ya-profile__danger-zone-row">
          <div>
            <h3 className="ya-section-heading ya-profile__danger-zone-title">Delete Account</h3>
            <p className="ya-text-muted">
              Permanently delete your Yunori account and all associated data.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={() => setIsDeleteAccountOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {isAvatarPickerOpen && user && (
        <AvatarPickerModal
          userId={user.id}
          currentAvatarType={profile?.avatar_type}
          currentAvatarValue={profile?.avatar_value}
          onCancel={() => setIsAvatarPickerOpen(false)}
          onSaved={handleAvatarSaved}
        />
      )}

      {isDeleteAccountOpen && (
        <DeleteAccountModal
          onCancel={() => setIsDeleteAccountOpen(false)}
          onDeleted={handleAccountDeleted}
        />
      )}
    </div>
  )
}

export default Profile
