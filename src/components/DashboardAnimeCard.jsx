import { useState } from 'react'
import { Heart, Tv } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import { updateAnimeFavourite } from '../services/animeEntries'
import './DashboardAnimeCard.css'

/**
 * Compact anime card used only on the Dashboard — a lightweight preview
 * (cover, title, status/category/rating, favourite toggle) without the
 * description or edit/delete actions that the full SavedAnimeCard shows
 * on My Anime and Watch List. Kept as its own component so this Dashboard
 * redesign never changes how those other pages look.
 */
function DashboardAnimeCard({ entry, userId, onFavouriteChange }) {
  const [favouriteSaving, setFavouriteSaving] = useState(false)
  const [favouriteError, setFavouriteError] = useState('')

  async function handleToggleFavourite() {
    if (favouriteSaving) return

    const nextFavourite = !entry.favourite
    setFavouriteSaving(true)
    setFavouriteError('')

    try {
      const updated = await updateAnimeFavourite(entry.id, userId, nextFavourite)
      onFavouriteChange?.(updated)
    } catch (err) {
      setFavouriteError(err.message || 'We could not update your favourite right now.')
    } finally {
      setFavouriteSaving(false)
    }
  }

  return (
    <Card hoverable className="ya-dash-card">
      <div className="ya-dash-card__cover">
        {entry.cover_image ? (
          <img src={entry.cover_image} alt={`${entry.title} cover`} loading="lazy" />
        ) : (
          <div className="ya-dash-card__cover-fallback" aria-hidden="true">
            <Tv size={24} />
          </div>
        )}
        <button
          type="button"
          className="ya-dash-card__favourite"
          onClick={handleToggleFavourite}
          disabled={favouriteSaving}
          aria-pressed={entry.favourite}
          aria-label={entry.favourite ? `Remove ${entry.title} from favourites` : `Add ${entry.title} to favourites`}
        >
          <Heart size={14} fill={entry.favourite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="ya-dash-card__body">
        <h4 className="ya-card-title ya-dash-card__title">{entry.title}</h4>

        <div className="ya-dash-card__meta">
          <Badge tone="primary">{entry.status || 'Want to Watch'}</Badge>
          {entry.category && <Badge tone="neutral">{entry.category}</Badge>}
          {entry.rating != null && <Badge tone="secondary">{'★'.repeat(entry.rating)}</Badge>}
        </div>

        {favouriteError && <p className="ya-field__error">{favouriteError}</p>}
      </div>
    </Card>
  )
}

export default DashboardAnimeCard
