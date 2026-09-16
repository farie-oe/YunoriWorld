import { useEffect, useState } from 'react'
import { UserCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profiles'
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

  return (
    <div>
      <PageHeader title="Profile" description="Your YourAnime identity, at a glance." />

      <Card className="ya-profile__card">
        <div className="ya-profile__avatar" aria-hidden="true">
          <UserCircle size={48} />
        </div>
        <div className="ya-profile__identity">
          <h2 className="ya-section-heading">{displayName}</h2>
          <Badge tone="secondary">ID: {uniqueId}</Badge>
        </div>
      </Card>

      {error && <p className="ya-field__error">{error}</p>}

      {!error && !loading && !profile && (
        <p className="ya-text-muted">
          Your profile is still being set up. Try refreshing this page in a moment.
        </p>
      )}

      <Card className="ya-profile__info">
        <h3 className="ya-section-heading ya-profile__info-title">Profile Information</h3>
        <dl className="ya-profile__info-grid">
          <div>
            <dt className="ya-text-muted">Display name</dt>
            <dd className="ya-body-text">{profile?.username || 'Not set yet'}</dd>
          </div>
          <div>
            <dt className="ya-text-muted">Email</dt>
            <dd className="ya-body-text">{user?.email || 'Not set yet'}</dd>
          </div>
          <div>
            <dt className="ya-text-muted">Member since</dt>
            <dd className="ya-body-text">{formatDate(profile?.created_at)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}

export default Profile
