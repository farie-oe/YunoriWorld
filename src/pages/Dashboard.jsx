import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ArrowRight, Search } from 'lucide-react'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import DashboardAnimeCard from '../components/DashboardAnimeCard'
import AnimeDetailsModal from '../components/AnimeDetailsModal'
import { Bow, Sparkle } from '../components/Decorative'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profiles'
import { getAnimeEntries } from '../services/animeEntries'
import catImage from '../assets/ui/cat-resting.png'
import emptyCollectionImage from '../assets/ui/empty-collection.png'
import totalIcon from '../assets/ui/total-anime.png'
import watchingIcon from '../assets/ui/watching.png'
import completedIcon from '../assets/ui/completed.png'
import favouritesIcon from '../assets/ui/favourites.png'
import watchListIcon from '../assets/ui/watch-list.png'
import './Dashboard.css'

const RECENTLY_ADDED_COUNT = 3

function SectionHeading({ icon, children, as: Tag = 'h2' }) {
  return (
    <div className="ya-dash__section-header">
      <Tag className="ya-dash__section-title">
        {icon}
        {children}
      </Tag>
      <Link to="/anime" className="ya-dash__view-all">
        View All
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  )
}

function StatTile({ tone, icon, value, label }) {
  return (
    <Link to="/anime" className={`ya-stat-tile ya-stat-tile--${tone}`}>
      <img src={icon} alt="" className="ya-stat-tile__icon" />
      <span className="ya-stat-tile__text">
        <span className="ya-stat-tile__value">{value}</span>
        <span className="ya-stat-tile__label">{label}</span>
      </span>
      <Sparkle className="ya-stat-tile__sparkle" />
    </Link>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [viewingEntry, setViewingEntry] = useState(null)
  const [searchText, setSearchText] = useState('')

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

  // The dashboard search hands off to My Anime, which filters the saved
  // collection by the same text (see the `q` param read in MyAnime).
  function handleSearch(event) {
    event.preventDefault()
    const trimmed = searchText.trim()
    navigate(trimmed ? `/anime?q=${encodeURIComponent(trimmed)}` : '/anime')
  }

  const displayName = profile?.username

  function renderCards(list) {
    return list.map((entry) => (
      <DashboardAnimeCard
        key={entry.id}
        entry={entry}
        userId={user?.id}
        onFavouriteChange={handleFavouriteChange}
        onView={setViewingEntry}
      />
    ))
  }

  return (
    <div className="ya-dash">
      <form className="ya-dash__search" onSubmit={handleSearch} role="search">
        <label htmlFor="dashboard-search" className="ya-visually-hidden">
          Search your anime
        </label>
        <Search size={22} aria-hidden="true" />
        <input
          id="dashboard-search"
          type="search"
          className="ya-dash__search-input"
          placeholder="Search anime..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </form>

      <header className="ya-dash__hero">
        <div className="ya-dash__greeting">
          {displayName && <p className="ya-eyebrow ya-dash__eyebrow">Welcome back,</p>}
          <h1 className="ya-dash__name">
            {displayName ? `${displayName}!` : 'Welcome back!'}
            <Sparkle className="ya-dash__name-sparkle" />
          </h1>
          <p className="ya-dash__tagline">
            Your anime journey continues
            <Heart size={16} aria-hidden="true" />
          </p>
        </div>
        <img src={catImage} alt="Yunori mascot" className="ya-dash__cat" />
      </header>

      {loading && (
        <p className="ya-text-muted" role="status">
          Loading your dashboard...
        </p>
      )}

      {!loading && error && (
        <div className="ya-dash__error">
          <p className="ya-field__error">{error}</p>
          <Button type="button" variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          image={emptyCollectionImage}
          title="Your anime journey starts here."
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
          <section className="ya-dash__panel ya-dash__stats" aria-label="Your collection at a glance">
            <StatTile tone="pink" icon={totalIcon} value={stats.total} label="Total Anime" />
            <StatTile tone="blue" icon={watchingIcon} value={stats.watching.length} label="Watching" />
            <StatTile tone="green" icon={completedIcon} value={stats.completed.length} label="Completed" />
            <StatTile tone="yellow" icon={favouritesIcon} value={stats.favourites.length} label="Favourites" />
          </section>

          <Link to="/watchlist" className="ya-dash__panel ya-dash__watchlist">
            <span className="ya-dash__watchlist-icon" aria-hidden="true">
              <img src={watchListIcon} alt="" />
            </span>
            <span className="ya-dash__watchlist-info">
              <span className="ya-dash__watchlist-title">{stats.wantToWatch.length} on your Watch List</span>
              <span className="ya-text-muted">Anime you're planning to watch next.</span>
            </span>
            <span className="ya-btn ya-btn--primary ya-dash__watchlist-link">
              View Watch List
              <ArrowRight size={18} aria-hidden="true" />
            </span>
          </Link>

          <section className="ya-dash__section">
            <SectionHeading icon={<Bow />}>Recently Added</SectionHeading>
            <div className="ya-dash__recent-grid">{renderCards(recentlyAdded)}</div>
          </section>

          <div className="ya-dash__duo">
            <section className="ya-dash__panel ya-dash__panel--blue" aria-label="Currently Watching">
              <SectionHeading icon={<img src={watchingIcon} alt="" className="ya-dash__heading-icon" />}>
                Currently Watching
              </SectionHeading>
              {stats.watching.length === 0 ? (
                <EmptyState
                  dashed
                  image={watchingIcon}
                  title="Nothing in progress yet."
                  description="Anime you mark as “Watching” will show up here."
                  action={
                    <Link to="/anime" className="ya-btn ya-btn--secondary">
                      <span>Browse My Anime</span>
                    </Link>
                  }
                />
              ) : (
                <div className="ya-dash__stack">{renderCards(stats.watching)}</div>
              )}
            </section>

            <section className="ya-dash__panel ya-dash__panel--pink" aria-label="Your Favourites">
              <SectionHeading icon={<img src={favouritesIcon} alt="" className="ya-dash__heading-icon" />}>
                Your Favourites
              </SectionHeading>
              {stats.favourites.length === 0 ? (
                <EmptyState
                  dashed
                  image={favouritesIcon}
                  title="Nothing favourited yet."
                  description="Tap the heart on any saved anime to add it here."
                  action={
                    <Link to="/anime" className="ya-btn ya-btn--primary">
                      <span>Browse My Anime</span>
                    </Link>
                  }
                />
              ) : (
                <div className="ya-dash__stack">{renderCards(stats.favourites)}</div>
              )}
            </section>
          </div>
        </>
      )}

      {viewingEntry && <AnimeDetailsModal entry={viewingEntry} onClose={() => setViewingEntry(null)} />}
    </div>
  )
}

export default Dashboard
