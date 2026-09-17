import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X, Clapperboard, SearchX, RotateCcw, FileDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import AnimeSearchResultCard from '../components/AnimeSearchResultCard'
import SavedAnimeCard from '../components/SavedAnimeCard'
import AddAnimeModal from '../components/AddAnimeModal'
import EditAnimeModal from '../components/EditAnimeModal'
import DeleteAnimeModal from '../components/DeleteAnimeModal'
import { searchAnime } from '../services/anilist'
import { getAnimeEntries } from '../services/animeEntries'
import { getProfile } from '../services/profiles'
import { exportCollectionToPdf } from '../services/pdfExport'
import { useAuth } from '../hooks/useAuth'
import { CATEGORIES, STATUS_OPTIONS } from '../constants/animeOptions'
import './MyAnime.css'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
]

const DEFAULT_STATUS_FILTER = 'All'
const DEFAULT_CATEGORY_FILTER = 'All'
const DEFAULT_SORT = 'recent'

function sortCollection(entries, sortBy) {
  const sorted = [...entries]

  if (sortBy === 'title-asc') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title))
  }
  if (sortBy === 'title-desc') {
    return sorted.sort((a, b) => b.title.localeCompare(a.title))
  }
  if (sortBy === 'rating-desc' || sortBy === 'rating-asc') {
    const rated = sorted.filter((entry) => entry.rating != null)
    const unrated = sorted.filter((entry) => entry.rating == null)
    rated.sort((a, b) => (sortBy === 'rating-desc' ? b.rating - a.rating : a.rating - b.rating))
    return [...rated, ...unrated]
  }

  // 'recent' — the collection already arrives from Supabase ordered by
  // date_added descending, so just preserve that order.
  return sorted.sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
}

function MyAnime() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAnime, setSelectedAnime] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)

  const [collection, setCollection] = useState([])
  const [collectionLoading, setCollectionLoading] = useState(true)
  const [collectionError, setCollectionError] = useState('')

  const [collectionSearch, setCollectionSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_CATEGORY_FILTER)
  const [favouriteOnly, setFavouriteOnly] = useState(false)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)

  const [exportStatus, setExportStatus] = useState('idle')
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getAnimeEntries(user.id)
      .then((entries) => {
        if (!cancelled) setCollection(entries)
      })
      .catch((err) => {
        console.error('Failed to load anime collection:', err)
        if (!cancelled) setCollectionError(err.message || 'We could not load your anime collection right now.')
      })
      .finally(() => {
        if (!cancelled) setCollectionLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  async function runSearch(event) {
    event.preventDefault()

    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const found = await searchAnime(trimmed)
      setResults(found)
    } catch (err) {
      console.error('AniList search failed:', err)
      setError(err.message || 'We could not search AniList right now.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setError('')
    setHasSearched(false)
  }

  const collectionAnilistIds = useMemo(
    () => new Set(collection.map((entry) => entry.anilist_id)),
    [collection],
  )

  function handleSelectAnime(anime) {
    setSelectedAnime(anime)
  }

  function handleCancelAdd() {
    setSelectedAnime(null)
  }

  function handleAnimeSaved(savedEntry) {
    setCollection((prev) =>
      prev.some((entry) => entry.id === savedEntry.id) ? prev : [savedEntry, ...prev],
    )
    setSelectedAnime(null)
  }

  function handleEditSelect(entry) {
    setEditingEntry(entry)
  }

  function handleEditCancel() {
    setEditingEntry(null)
  }

  function handleEditSaved(updatedEntry) {
    setCollection((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
    setEditingEntry(null)
  }

  function handleFavouriteChange(updatedEntry) {
    setCollection((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
  }

  function handleDeleteRequest(entry) {
    setDeletingEntry(entry)
  }

  function handleDeleteCancel() {
    setDeletingEntry(null)
  }

  function handleDeleted(deletedEntryId) {
    setCollection((prev) => prev.filter((entry) => entry.id !== deletedEntryId))
    setDeletingEntry(null)
  }

  const hasActiveControls =
    collectionSearch.trim() !== '' ||
    statusFilter !== DEFAULT_STATUS_FILTER ||
    categoryFilter !== DEFAULT_CATEGORY_FILTER ||
    favouriteOnly ||
    sortBy !== DEFAULT_SORT

  function handleResetControls() {
    setCollectionSearch('')
    setStatusFilter(DEFAULT_STATUS_FILTER)
    setCategoryFilter(DEFAULT_CATEGORY_FILTER)
    setFavouriteOnly(false)
    setSortBy(DEFAULT_SORT)
  }

  const filteredCollection = useMemo(() => {
    const query = collectionSearch.trim().toLowerCase()

    const filtered = collection.filter((entry) => {
      if (query) {
        const matchesTitle = entry.title.toLowerCase().includes(query)
        const matchesDescription = entry.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }
      if (statusFilter !== DEFAULT_STATUS_FILTER && entry.status !== statusFilter) return false
      if (categoryFilter !== DEFAULT_CATEGORY_FILTER && entry.category !== categoryFilter) return false
      if (favouriteOnly && !entry.favourite) return false
      return true
    })

    return sortCollection(filtered, sortBy)
  }, [collection, collectionSearch, statusFilter, categoryFilter, favouriteOnly, sortBy])

  const isFilteredView = filteredCollection.length !== collection.length

  async function handleExport() {
    if (exportStatus === 'generating' || filteredCollection.length === 0 || !user) return

    setExportStatus('generating')
    setExportError('')

    let username
    try {
      const profile = await getProfile(user.id)
      username = profile?.username
    } catch (err) {
      console.error('Failed to load profile for PDF export:', err)
    }

    try {
      await exportCollectionToPdf({
        entries: filteredCollection,
        username,
        isFiltered: isFilteredView,
      })
      setExportStatus('idle')
    } catch (err) {
      console.error('Failed to export anime collection to PDF:', err)
      setExportError(err.message || 'We could not generate your PDF right now. Please try again.')
      setExportStatus('error')
    }
  }

  return (
    <div>
      <PageHeader
        title="My Anime"
        description="Every anime you've added to your collection, in one place."
        action={<Button icon={Plus}>Add Anime</Button>}
      />

      <Card className="ya-anime-search">
        <h2 className="ya-section-heading">Add Anime</h2>
        <p className="ya-text-muted ya-anime-search__hint">
          Search AniList to find anime you'd like to add to your collection.
        </p>

        <form className="ya-anime-search__form" onSubmit={runSearch} role="search">
          <label htmlFor="anilist-search-input" className="ya-visually-hidden">
            Search for an anime
          </label>
          <div className="ya-anime-search__input-wrap">
            <Search size={18} aria-hidden="true" />
            <input
              id="anilist-search-input"
              type="search"
              className="ya-input ya-anime-search__input"
              placeholder="Search for an anime..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={!query.trim() || loading}>
            Search
          </Button>
          {(query || hasSearched) && (
            <Button type="button" variant="outline" icon={X} onClick={handleClear} aria-label="Clear search">
              Clear
            </Button>
          )}
        </form>

        <div className="ya-anime-search__results">
          {loading && (
            <p className="ya-text-muted" role="status">
              Searching AniList...
            </p>
          )}

          {!loading && error && <p className="ya-field__error">{error}</p>}

          {!loading && !error && hasSearched && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No anime found"
              description="Try a different title or check your spelling."
            />
          )}

          {!loading && !error && !hasSearched && (
            <p className="ya-text-muted">Search for an anime above to get started.</p>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="ya-anime-search__grid">
              {results.map((anime) => (
                <AnimeSearchResultCard
                  key={anime.id}
                  anime={anime}
                  isAdded={collectionAnilistIds.has(anime.id)}
                  onSelect={handleSelectAnime}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {!collectionLoading && !collectionError && (
        <div className="ya-export-bar">
          <p className="ya-text-muted ya-export-bar__message">
            {collection.length === 0
              ? 'Your collection is still waiting for its first anime. ♡'
              : isFilteredView
                ? `Export the ${filteredCollection.length} anime currently shown.`
                : 'Export your anime collection as a PDF.'}
          </p>
          <Button
            type="button"
            variant="outline"
            icon={FileDown}
            onClick={handleExport}
            disabled={filteredCollection.length === 0 || exportStatus === 'generating'}
          >
            {exportStatus === 'generating' ? 'Generating PDF...' : 'Export Collection'}
          </Button>
        </div>
      )}

      {exportStatus === 'error' && exportError && <p className="ya-field__error">{exportError}</p>}

      {!collectionLoading && !collectionError && collection.length > 0 && (
        <div className="ya-collection-toolbar">
          <p className="ya-label ya-collection-toolbar__label">Your Collection</p>

          <div className="ya-collection-toolbar__row">
            <div className="ya-collection-toolbar__search">
              <Search size={16} aria-hidden="true" />
              <label htmlFor="my-anime-search-input" className="ya-visually-hidden">
                Search your saved anime
              </label>
              <input
                id="my-anime-search-input"
                type="search"
                className="ya-collection-toolbar__search-input"
                placeholder="Search your collection..."
                value={collectionSearch}
                onChange={(event) => setCollectionSearch(event.target.value)}
              />
            </div>

            <label htmlFor="status-filter" className="ya-visually-hidden">
              Filter by status
            </label>
            <select
              id="status-filter"
              className="ya-input ya-collection-toolbar__select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value={DEFAULT_STATUS_FILTER}>All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label htmlFor="category-filter" className="ya-visually-hidden">
              Filter by category
            </label>
            <select
              id="category-filter"
              className="ya-input ya-collection-toolbar__select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value={DEFAULT_CATEGORY_FILTER}>All categories</option>
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label htmlFor="favourite-filter" className="ya-visually-hidden">
              Filter by favourite
            </label>
            <select
              id="favourite-filter"
              className="ya-input ya-collection-toolbar__select"
              value={favouriteOnly ? 'favourites' : 'all'}
              onChange={(event) => setFavouriteOnly(event.target.value === 'favourites')}
            >
              <option value="all">All anime</option>
              <option value="favourites">Favourites only</option>
            </select>

            <label htmlFor="sort-by" className="ya-visually-hidden">
              Sort collection
            </label>
            <select
              id="sort-by"
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

            {hasActiveControls && (
              <Button
                type="button"
                variant="outline"
                icon={RotateCcw}
                onClick={handleResetControls}
                aria-label="Reset search, filters, and sorting"
              >
                Clear
              </Button>
            )}
          </div>

          <p className="ya-meta-text ya-collection-toolbar__count">
            Showing {filteredCollection.length} of {collection.length} anime
          </p>
        </div>
      )}

      {collectionLoading && (
        <p className="ya-text-muted" role="status">
          Loading your anime collection...
        </p>
      )}

      {!collectionLoading && collectionError && <p className="ya-field__error">{collectionError}</p>}

      {!collectionLoading && !collectionError && collection.length === 0 && (
        <EmptyState
          icon={Clapperboard}
          title="Your collection is empty"
          description="Search for an anime above to add your first one."
        />
      )}

      {!collectionLoading && !collectionError && collection.length > 0 && filteredCollection.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No anime match your filters"
          description="Try a different search term or clear your filters."
          action={
            <Button type="button" variant="outline" icon={RotateCcw} onClick={handleResetControls}>
              Clear Filters
            </Button>
          }
        />
      )}

      {!collectionLoading && !collectionError && filteredCollection.length > 0 && (
        <div className="ya-anime-search__grid">
          {filteredCollection.map((entry) => (
            <SavedAnimeCard
              key={entry.id}
              entry={entry}
              userId={user?.id}
              onEdit={handleEditSelect}
              onFavouriteChange={handleFavouriteChange}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {selectedAnime && user && (
        <AddAnimeModal
          anime={selectedAnime}
          userId={user.id}
          onCancel={handleCancelAdd}
          onSaved={handleAnimeSaved}
        />
      )}

      {editingEntry && user && (
        <EditAnimeModal
          entry={editingEntry}
          userId={user.id}
          onCancel={handleEditCancel}
          onSaved={handleEditSaved}
        />
      )}

      {deletingEntry && user && (
        <DeleteAnimeModal
          entry={deletingEntry}
          userId={user.id}
          onCancel={handleDeleteCancel}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default MyAnime
