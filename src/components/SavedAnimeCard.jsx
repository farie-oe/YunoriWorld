import { Heart, Pencil, Tv } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import Button from './Button'
import './SavedAnimeCard.css'

function SavedAnimeCard({ entry, onEdit }) {
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
        {entry.favourite && (
          <span className="ya-saved-card__favourite" aria-label="Favourite">
            <Heart size={16} fill="currentColor" />
          </span>
        )}
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
      </div>
    </Card>
  )
}

export default SavedAnimeCard
