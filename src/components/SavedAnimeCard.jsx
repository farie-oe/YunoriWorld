import { useState } from 'react'
import { Heart, Pencil, Trash2, Tv } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import Button from './Button'
import { updateAnimeFavourite } from '../services/animeEntries'
import './SavedAnimeCard.css'

function SavedAnimeCard({ entry, userId, onEdit, onFavouriteChange, onDeleteRequest }) {
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
    <Card className="ya-saved-card">
      <div className="ya-saved-card__cover">
        {entry.cover_image ? (
          <img src={entry.cover_image} alt="" loading="lazy" />
        ) : (
          <div className="ya-saved-card__cover-fallback" aria-hidden="true">
            <Tv size={28} />
          </div>
        )}
        <button
          type="button"
          className="ya-saved-card__favourite"
          onClick={handleToggleFavourite}
          disabled={favouriteSaving}
          aria-pressed={entry.favourite}
          aria-label={entry.favourite ? `Remove ${entry.title} from favourites` : `Add ${entry.title} to favourites`}
        >
          <Heart size={16} fill={entry.favourite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="ya-saved-card__body">
        <h3 className="ya-section-heading ya-saved-card__title">{entry.title}</h3>

        <div className="ya-saved-card__badges">
          <Badge tone="primary">{entry.status || 'Want to Watch'}</Badge>
          {entry.category && <Badge tone="neutral">{entry.category}</Badge>}
          {entry.rating != null && <Badge tone="secondary">{'★'.repeat(entry.rating)}</Badge>}
        </div>

        <p className="ya-text-muted ya-saved-card__description">
          {entry.description || 'No description added yet.'}
        </p>

        {favouriteError && <p className="ya-field__error">{favouriteError}</p>}

        {(onEdit || onDeleteRequest) && (
          <div className="ya-saved-card__actions">
            {onEdit && (
              <Button
                variant="outline"
                icon={Pencil}
                className="ya-saved-card__edit-btn"
                onClick={() => onEdit(entry)}
                aria-label={`Edit ${entry.title}`}
              >
                Edit
              </Button>
            )}
            {onDeleteRequest && (
              <Button
                variant="danger"
                icon={Trash2}
                className="ya-saved-card__delete-btn"
                onClick={() => onDeleteRequest(entry)}
                aria-label={`Delete ${entry.title} from My Anime`}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default SavedAnimeCard
