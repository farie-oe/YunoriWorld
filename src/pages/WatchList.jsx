import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import SavedAnimeCard from '../components/SavedAnimeCard'
import { getWatchList } from '../services/animeEntries'
import { useAuth } from '../hooks/useAuth'
import './MyAnime.css'

function WatchList() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getWatchList(user.id)
      .then((result) => {
        if (!cancelled) setEntries(result)
      })
      .catch((err) => {
        console.error('Failed to load watch list:', err)
        if (!cancelled) setError(err.message || 'We could not load your watch list right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div>
      <PageHeader title="Watch List" description="Anime you're planning to watch next." />

      {loading && (
        <p className="ya-text-muted" role="status">
          Loading your watch list...
        </p>
      )}

      {!loading && error && <p className="ya-field__error">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing on your watch list yet"
          description="Anime you add with a “Want to Watch” status will appear here."
          action={
            <Link to="/anime" className="ya-btn ya-btn--primary">
              <span>Search for Anime</span>
            </Link>
          }
        />
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="ya-anime-search__grid">
          {entries.map((entry) => (
            <SavedAnimeCard
              key={entry.id}
              entry={entry}
              userId={user?.id}
              onFavouriteChange={(updated) =>
                setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default WatchList
