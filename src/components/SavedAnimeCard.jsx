import { useState } from 'react'
import { Heart, Pencil, Trash2, Tv } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import Button from './Button'
import { updateAnimeFavourite } from '../services/animeEntries'
import './SavedAnimeCard.css'

function SavedAnimeCard({ entry, userId, onEdit, onView, onFavouriteChange, onDeleteRequest }) {
  const [favouriteSaving, setFavouriteSaving] = useState(false)
  const [favouriteError, setFavouriteError] = useState('')

  const isViewable = Boolean(onView)

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

  function handleFavouriteClick(event) {
    event.stopPropagation()
    handleToggleFavourite()
  }

  function handleEditClick(event) {
    event.stopPropagation()
    onEdit(entry)
  }

  function handleDeleteClick(event) {
    event.stopPropagation()
    onDeleteRequest(entry)
  }

  function handleCardKeyDown(event) {
    if (!isViewable) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onView(entry)
    }
  }

  return (
    <Card
      className="ya-saved-card"
      hoverable={isViewable}
      onClick={isViewable ? () => onView(entry) : undefined}
      onKeyDown={isViewable ? handleCardKeyDown : undefined}
      role={isViewable ? 'button' : undefined}
      tabIndex={isViewable ? 0 : undefined}
      aria-label={isViewable ? `View details for ${entry.title}` : undefined}
    >
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
          onClick={handleFavouriteClick}
          disabled={favouriteSaving}
          aria-pressed={entry.favourite}
          aria-label={entry.favourite ? `Remove ${entry.title} from favourites` : `Add ${entry.title} to favourites`}
        >
          <Heart size={14} fill={entry.favourite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="ya-saved-card__body">
        <h3 className="ya-section-heading ya-saved-card__title">{entry.title}</h3>

        <div className="ya-saved-card__badges">
          <Badge tone="primary">{entry.status || 'Want to Watch'}</Badge>
          {entry.category && <Badge tone="neutral">{entry.category}</Badge>}
          {entry.rating != null && (
            <Badge tone="neutral" className="ya-rating-badge">
              {'★'.repeat(entry.rating)}
            </Badge>
          )}
        </div>

        {favouriteError && <p className="ya-field__error">{favouriteError}</p>}

        {(onEdit || onDeleteRequest) && (
          <div className="ya-saved-card__actions">
            {onEdit && (
              <Button
                variant="outline"
                icon={Pencil}
                className="ya-saved-card__edit-btn"
                onClick={handleEditClick}
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
                onClick={handleDeleteClick}
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
