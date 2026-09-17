import { useState } from 'react'
import { Heart, Tv } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import { updateAnimeFavourite } from '../services/animeEntries'
import './DashboardAnimeCard.css'

/**
 * Compact, editorial anime card used only on the Dashboard — cover art,
 * title, status/category/rating, and a favourite toggle, without the
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
            <Tv size={22} />
          </div>
        )}
      </div>

      <div className="ya-dash-card__body">
        <div className="ya-dash-card__heading">
          <h4 className="ya-dash-card__title">{entry.title}</h4>
          <button
            type="button"
            className="ya-dash-card__favourite"
            onClick={handleToggleFavourite}
            disabled={favouriteSaving}
            aria-pressed={entry.favourite}
            aria-label={entry.favourite ? `Remove ${entry.title} from favourites` : `Add ${entry.title} to favourites`}
          >
            <Heart size={15} fill={entry.favourite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="ya-dash-card__meta">
          <Badge tone="primary">{entry.status || 'Want to Watch'}</Badge>
          {entry.category && <Badge tone="neutral">{entry.category}</Badge>}
        </div>

        {entry.rating != null && (
          <div className="ya-dash-card__rating" aria-label={`Rated ${entry.rating} out of 5`}>
            <span className="ya-dash-card__rating-filled">{'★'.repeat(entry.rating)}</span>
            <span className="ya-dash-card__rating-empty">{'☆'.repeat(Math.max(0, 5 - entry.rating))}</span>
          </div>
        )}

        {favouriteError && <p className="ya-field__error">{favouriteError}</p>}
      </div>
    </Card>
  )
}

export default DashboardAnimeCard
