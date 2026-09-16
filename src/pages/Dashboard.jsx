import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clapperboard,
  PlayCircle,
  CheckCircle2,
  Heart,
  Bookmark,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import DashboardAnimeCard from '../components/DashboardAnimeCard'
import { Sparkle, Blossom, DecorativeHeart } from '../components/Decorative'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profiles'
import { getAnimeEntries } from '../services/animeEntries'
import mascotImage from '../assets/mascot/yunori-mascot.png'
import './Dashboard.css'

const RECENTLY_ADDED_COUNT = 4

function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getProfile(user.id)
      .then((result) => {
        if (!cancelled) setProfile(result)
      })
      .catch((err) => {
        console.error('Failed to load profile for dashboard:', err)
      })

    getAnimeEntries(user.id)
      .then((result) => {
        if (!cancelled) setEntries(result)
      })
      .catch((err) => {
        console.error('Failed to load anime entries for dashboard:', err)
        if (!cancelled) setError(err.message || 'We could not load your anime data right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, retryToken])

  const stats = useMemo(() => {
    const watching = entries.filter((entry) => entry.status === 'Watching')
    const completed = entries.filter((entry) => entry.status === 'Completed')
    const favourites = entries.filter((entry) => entry.favourite)
    const wantToWatch = entries.filter((entry) => entry.status === 'Want to Watch')

    return {
      total: entries.length,
      watching,
      completed,
      favourites,
      wantToWatch,
    }
  }, [entries])

  const recentlyAdded = entries.slice(0, RECENTLY_ADDED_COUNT)

  function handleFavouriteChange(updatedEntry) {
    setEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
  }

  function handleRetry() {
    setLoading(true)
    setError('')
    setRetryToken((token) => token + 1)
  }

  const displayName = profile?.username

  return (
    <div>
      <div className="ya-dashboard__hero">
        <Blossom className="ya-dashboard__hero-decor" />
        <PageHeader
          title={displayName ? `Welcome back, ${displayName}! ♡` : 'Welcome back! ♡'}
          description={
            <span className="ya-dashboard__tagline">
              <Sparkle /> Here's a little look at your anime journey. <DecorativeHeart />
            </span>
          }
          action={
            <img
              src={mascotImage}
              alt="Yunori mascot"
              className="ya-dashboard__mascot"
            />
          }
        />
      </div>

      {loading && (
        <p className="ya-text-muted" role="status">
          Loading your dashboard...
        </p>
      )}

      {!loading && error && (
        <div className="ya-dashboard__error">
          <p className="ya-field__error">{error}</p>
          <Button type="button" variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Your anime journey starts here ♡"
          description="Search AniList and add your first anime to start building your collection."
          action={
            <Link to="/anime" className="ya-btn ya-btn--primary">
              <span>Discover Anime</span>
            </Link>
          }
        />
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          <section className="ya-dashboard__section">
            <h2 className="ya-section-heading">Your Anime Journey</h2>
            <p className="ya-text-muted ya-dashboard__section-sub">
              A quick snapshot of your collection.
            </p>

            <div className="ya-dashboard__stats">
              <Card as={Link} to="/anime" hoverable className="ya-stat-card">
                <div className="ya-stat-card__icon ya-stat-card__icon--lavender" aria-hidden="true">
                  <Clapperboard size={22} />
                </div>
                <span className="ya-stat-card__value">{stats.total}</span>
                <span className="ya-text-muted ya-stat-card__label">Total Anime</span>
              </Card>

              <Card as={Link} to="/anime" hoverable className="ya-stat-card">
                <div className="ya-stat-card__icon ya-stat-card__icon--blue" aria-hidden="true">
                  <PlayCircle size={22} />
                </div>
                <span className="ya-stat-card__value">{stats.watching.length}</span>
                <span className="ya-text-muted ya-stat-card__label">Watching</span>
              </Card>

              <Card as={Link} to="/anime" hoverable className="ya-stat-card">
                <div className="ya-stat-card__icon ya-stat-card__icon--success" aria-hidden="true">
                  <CheckCircle2 size={22} />
                </div>
                <span className="ya-stat-card__value">{stats.completed.length}</span>
                <span className="ya-text-muted ya-stat-card__label">Completed</span>
              </Card>

              <Card as={Link} to="/anime" hoverable className="ya-stat-card">
                <div className="ya-stat-card__icon ya-stat-card__icon--pink" aria-hidden="true">
                  <Heart size={22} />
                </div>
                <span className="ya-stat-card__value">{stats.favourites.length}</span>
                <span className="ya-text-muted ya-stat-card__label">Favourites</span>
              </Card>
            </div>
          </section>

          <section className="ya-dashboard__section">
            <Card as={Link} to="/watchlist" hoverable className="ya-dashboard__watchlist-card">
              <div className="ya-stat-card__icon ya-stat-card__icon--blue" aria-hidden="true">
                <Bookmark size={22} />
              </div>
              <div className="ya-dashboard__watchlist-info">
                <span className="ya-section-heading">{stats.wantToWatch.length} on your Watch List</span>
                <span className="ya-text-muted">Anime you're planning to watch next.</span>
              </div>
              <span className="ya-form-link ya-dashboard__watchlist-link">
                View Watch List
                <ChevronRight size={16} aria-hidden="true" />
              </span>
            </Card>
          </section>

          <section className="ya-dashboard__section">
            <h2 className="ya-section-heading ya-dashboard__section-title">
              <Sparkles size={18} className="ya-dashboard__section-icon" aria-hidden="true" />
              Recently Added
            </h2>
            <p className="ya-text-muted ya-dashboard__section-sub">Your newest additions to My Anime.</p>
            <div className="ya-dashboard__anime-grid">
              {recentlyAdded.map((entry) => (
                <DashboardAnimeCard
                  key={entry.id}
                  entry={entry}
                  userId={user?.id}
                  onFavouriteChange={handleFavouriteChange}
                />
              ))}
            </div>
          </section>

          <section className="ya-dashboard__section">
            <h2 className="ya-section-heading ya-dashboard__section-title">
              <PlayCircle size={18} className="ya-dashboard__section-icon" aria-hidden="true" />
              Currently Watching
            </h2>
            <p className="ya-text-muted ya-dashboard__section-sub">Pick up where you left off.</p>
            {stats.watching.length === 0 ? (
              <EmptyState
                icon={PlayCircle}
                title="Nothing in progress yet ♡"
                description="Anime you mark as “Watching” will show up here."
                action={
                  <Link to="/anime" className="ya-btn ya-btn--outline">
                    <span>Browse My Anime</span>
                  </Link>
                }
              />
            ) : (
              <div className="ya-dashboard__anime-grid">
                {stats.watching.map((entry) => (
                  <DashboardAnimeCard
                    key={entry.id}
                    entry={entry}
                    userId={user?.id}
                    onFavouriteChange={handleFavouriteChange}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="ya-dashboard__section">
            <h2 className="ya-section-heading ya-dashboard__section-title">
              <Heart size={18} className="ya-dashboard__section-icon" aria-hidden="true" />
              Your Favourites
            </h2>
            <p className="ya-text-muted ya-dashboard__section-sub">The anime closest to your heart.</p>
            {stats.favourites.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Nothing favourited yet ♡"
                description="Tap the heart on any saved anime to add it here."
                action={
                  <Link to="/anime" className="ya-btn ya-btn--outline">
                    <span>Browse My Anime</span>
                  </Link>
                }
              />
            ) : (
              <div className="ya-dashboard__anime-grid">
                {stats.favourites.map((entry) => (
                  <DashboardAnimeCard
                    key={entry.id}
                    entry={entry}
                    userId={user?.id}
                    onFavouriteChange={handleFavouriteChange}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default Dashboard
