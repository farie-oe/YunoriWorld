import { useState } from 'react'
import { Search, Plus, X, Clapperboard, SearchX } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import AnimeSearchResultCard from '../components/AnimeSearchResultCard'
import { searchAnime } from '../services/anilist'
import './MyAnime.css'

function MyAnime() {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addedIds, setAddedIds] = useState(() => new Set())

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

  function handleAdd(anime) {
    setAddedIds((prev) => new Set(prev).add(anime.id))
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
                  isAdded={addedIds.has(anime.id)}
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

      <EmptyState
        icon={Clapperboard}
        title="Your collection is empty"
        description="Anime you add will show up here, ready to track and organise."
        action={<Button icon={Plus}>Add Your First Anime</Button>}
      />
    </div>
  )
}

export default MyAnime
