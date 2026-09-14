import { UserCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import './Profile.css'

function Profile() {
  return (
    <div>
      <PageHeader title="Profile" description="Your YourAnime identity, at a glance." />

      <Card className="ya-profile__card">
        <div className="ya-profile__avatar" aria-hidden="true">
          <UserCircle size={48} />
        </div>
        <div className="ya-profile__identity">
          <h2 className="ya-section-heading">Username placeholder</h2>
          <Badge tone="secondary">ID: —————</Badge>
        </div>
      </Card>

      <Card className="ya-profile__info">
        <h3 className="ya-section-heading ya-profile__info-title">Profile Information</h3>
        <dl className="ya-profile__info-grid">
          <div>
            <dt className="ya-text-muted">Display name</dt>
            <dd className="ya-body-text">Not set yet</dd>
          </div>
          <div>
            <dt className="ya-text-muted">Email</dt>
            <dd className="ya-body-text">Not set yet</dd>
          </div>
          <div>
            <dt className="ya-text-muted">Member since</dt>
            <dd className="ya-body-text">Not set yet</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}

export default Profile
