import { useEffect, useState } from 'react'
import { Search, Plus, X, Clapperboard, SearchX } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import AnimeSearchResultCard from '../components/AnimeSearchResultCard'
import SavedAnimeCard from '../components/SavedAnimeCard'
import { searchAnime } from '../services/anilist'
import { addAnimeEntry, getAnimeEntries } from '../services/animeEntries'
import { useAuth } from '../hooks/useAuth'
import './MyAnime.css'

function MyAnime() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addState, setAddState] = useState({})

  const [collection, setCollection] = useState([])
  const [collectionLoading, setCollectionLoading] = useState(true)
  const [collectionError, setCollectionError] = useState('')

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

  async function handleAdd(anime) {
    if (!user) return

    const current = addState[anime.id]?.state
    if (current === 'saving' || current === 'added' || current === 'duplicate') return

    setAddState((prev) => ({ ...prev, [anime.id]: { state: 'saving' } }))

    try {
      const savedEntry = await addAnimeEntry(anime, user.id)
      setAddState((prev) => ({ ...prev, [anime.id]: { state: 'added' } }))
      setCollection((prev) =>
        prev.some((entry) => entry.id === savedEntry.id) ? prev : [savedEntry, ...prev],
      )
    } catch (err) {
      const isDuplicate = err.message === 'Already in My Anime'
      setAddState((prev) => ({
        ...prev,
        [anime.id]: isDuplicate
          ? { state: 'duplicate' }
          : { state: 'error', error: err.message || 'We could not add this anime right now.' },
      }))
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
                  addState={addState[anime.id]?.state ?? 'idle'}
                  addError={addState[anime.id]?.error ?? ''}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="ya-my-anime__toolbar">
        <div className="ya-my-anime__search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            className="ya-input ya-my-anime__search-input"
            placeholder="Search your anime..."
            aria-label="Search your anime"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

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

      {!collectionLoading && !collectionError && collection.length > 0 && (
        <div className="ya-anime-search__grid">
          {collection.map((entry) => (
            <SavedAnimeCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyAnime
