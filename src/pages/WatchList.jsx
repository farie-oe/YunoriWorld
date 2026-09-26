import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import SavedAnimeCard from '../components/SavedAnimeCard'
import EditAnimeModal from '../components/EditAnimeModal'
import AnimeDetailsModal from '../components/AnimeDetailsModal'
import Button from '../components/Button'
import { getWatchList, backfillMissingGenres } from '../services/animeEntries'
import { useAuth } from '../hooks/useAuth'
import './MyAnime.css'
import './WatchList.css'

const GENRE_FILTER_ALL = 'All'
const DATE_FILTER_ALL = 'all'
const DEFAULT_SORT = 'recent'

const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Added today' },
  { value: 'week', label: 'Added this week' },
  { value: 'month', label: 'Added this month' },
  { value: 'older', label: 'Older' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest Added' },
  { value: 'oldest', label: 'Oldest Added' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
]

/**
 * Returns the local-time boundary (or boundaries) for a Date Added filter
 * option, so comparisons happen against the viewer's own calendar day/week/
 * month rather than raw UTC — a date_added of "just after midnight UTC" for
 * a viewer west of UTC should not be miscategorised as "yesterday".
 */
function getDateFilterRange(filterId) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (filterId === 'today') {
    return { from: startOfToday, to: null }
  }
  if (filterId === 'week') {
    const from = new Date(startOfToday)
    from.setDate(from.getDate() - 6)
    return { from, to: null }
  }
  if (filterId === 'month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null }
  }
  if (filterId === 'older') {
    return { from: null, to: new Date(now.getFullYear(), now.getMonth(), 1) }
  }
  return null
}

function sortEntries(entries, sortBy) {
  const sorted = [...entries]

  if (sortBy === 'oldest') {
    return sorted.sort((a, b) => new Date(a.date_added) - new Date(b.date_added))
  }
  if (sortBy === 'title-asc') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title))
  }
  if (sortBy === 'title-desc') {
    return sorted.sort((a, b) => b.title.localeCompare(a.title))
  }

  // 'recent' (Newest Added) — the default.
  return sorted.sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
}

function WatchList() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [viewingEntry, setViewingEntry] = useState(null)

  const [genreFilter, setGenreFilter] = useState(GENRE_FILTER_ALL)
  const [dateFilter, setDateFilter] = useState(DATE_FILTER_ALL)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getWatchList(user.id)
      .then((result) => {
        if (cancelled) return

        setEntries(result)
        setLoading(false)

        // Progressive enhancement: entries saved before genres were
        // persisted start with an empty genres array. Look those up on
        // AniList by their existing anilist_id and merge the results in
        // once available, so the Genre filter fills in without blocking
        // the initial render.
        backfillMissingGenres(result, user.id).then((updated) => {
          if (cancelled || updated.length === 0) return
          setEntries((prev) =>
            prev.map((entry) => updated.find((updatedEntry) => updatedEntry.id === entry.id) || entry),
          )
        })
      })
      .catch((err) => {
        console.error('Failed to load watch list:', err)
        if (!cancelled) {
          setError(err.message || 'We could not load your watch list right now.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const availableGenres = useMemo(() => {
    const genreSet = new Set()
    entries.forEach((entry) => {
      ;(entry.genres || []).forEach((genre) => genreSet.add(genre))
    })
    return [...genreSet].sort((a, b) => a.localeCompare(b))
  }, [entries])

  const hasActiveFilters =
    genreFilter !== GENRE_FILTER_ALL || dateFilter !== DATE_FILTER_ALL || sortBy !== DEFAULT_SORT

  function handleResetFilters() {
    setGenreFilter(GENRE_FILTER_ALL)
    setDateFilter(DATE_FILTER_ALL)
    setSortBy(DEFAULT_SORT)
  }

  const filteredEntries = useMemo(() => {
    const dateRange = getDateFilterRange(dateFilter)

    const filtered = entries.filter((entry) => {
      if (genreFilter !== GENRE_FILTER_ALL && !(entry.genres || []).includes(genreFilter)) {
        return false
      }
      if (dateRange) {
        const addedAt = new Date(entry.date_added)
        if (dateRange.from && addedAt < dateRange.from) return false
        if (dateRange.to && addedAt >= dateRange.to) return false
      }
      return true
    })

    return sortEntries(filtered, sortBy)
  }, [entries, genreFilter, dateFilter, sortBy])

  function handleEditCancel() {
    setEditingEntry(null)
  }

  function handleEditSaved(updatedEntry) {
    setEntries((prev) =>
      updatedEntry.status === 'Want to Watch'
        ? prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item))
        : prev.filter((item) => item.id !== updatedEntry.id),
    )
    setEditingEntry(null)
  }

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
        <>
          <div className="ya-collection-toolbar">
            <div className="ya-collection-toolbar__row">
              <label htmlFor="watchlist-genre-filter" className="ya-visually-hidden">
                Filter by genre
              </label>
              <select
                id="watchlist-genre-filter"
                className="ya-input ya-collection-toolbar__select"
                value={genreFilter}
                onChange={(event) => setGenreFilter(event.target.value)}
              >
                <option value={GENRE_FILTER_ALL}>All genres</option>
                {availableGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>

              <label htmlFor="watchlist-date-filter" className="ya-visually-hidden">
                Filter by date added
              </label>
              <select
                id="watchlist-date-filter"
                className="ya-input ya-collection-toolbar__select"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                {DATE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label htmlFor="watchlist-sort" className="ya-visually-hidden">
                Sort watch list
              </label>
              <select
                id="watchlist-sort"
                className="ya-input ya-collection-toolbar__select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  icon={RotateCcw}
                  onClick={handleResetFilters}
                  aria-label="Reset genre, date, and sort filters"
                >
                  Clear
                </Button>
              )}
            </div>

            <p className="ya-meta-text ya-collection-toolbar__count">
              Showing {filteredEntries.length} of {entries.length} anime
            </p>
          </div>

          {filteredEntries.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No anime match your filters"
              description="Try a different genre or date range."
              action={
                <Button type="button" variant="outline" icon={RotateCcw} onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="ya-anime-search__grid ya-watchlist__grid">
              {filteredEntries.map((entry) => (
                <SavedAnimeCard
                  key={entry.id}
                  entry={entry}
                  userId={user?.id}
                  onView={setViewingEntry}
                  onEdit={setEditingEntry}
                  onFavouriteChange={(updated) =>
                    setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {editingEntry && user && (
        <EditAnimeModal
          entry={editingEntry}
          userId={user.id}
          onCancel={handleEditCancel}
          onSaved={handleEditSaved}
        />
      )}

      {viewingEntry && <AnimeDetailsModal entry={viewingEntry} onClose={() => setViewingEntry(null)} />}
    </div>
  )
}

export default WatchList
