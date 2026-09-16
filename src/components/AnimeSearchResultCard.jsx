import { Check, Plus, Star, Tv } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import Button from './Button'
import './AnimeSearchResultCard.css'

function formatStatus(status) {
  if (!status) return null
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function formatSeason(season, year) {
  if (!season && !year) return null
  const seasonLabel = season ? season[0].toUpperCase() + season.slice(1).toLowerCase() : ''
  return [seasonLabel, year].filter(Boolean).join(' ')
}

function AnimeSearchResultCard({ anime, addState = 'idle', addError = '', onAdd }) {
  const title = anime.title?.english || anime.title?.romaji || 'Untitled'
  const secondaryTitle =
    anime.title?.english && anime.title?.romaji && anime.title.romaji !== anime.title.english
      ? anime.title.romaji
      : null
  const seasonLabel = formatSeason(anime.season, anime.seasonYear)
  const statusLabel = formatStatus(anime.status)
  const genres = anime.genres?.slice(0, 3) ?? []

  return (
    <Card className="ya-anime-card">
      <div className="ya-anime-card__cover">
        {anime.coverImage ? (
          <img src={anime.coverImage} alt="" loading="lazy" />
        ) : (
          <div className="ya-anime-card__cover-fallback" aria-hidden="true">
            <Tv size={28} />
          </div>
        )}
      </div>

      <div className="ya-anime-card__body">
        <h3 className="ya-section-heading ya-anime-card__title">{title}</h3>
        {secondaryTitle && <p className="ya-text-muted ya-anime-card__subtitle">{secondaryTitle}</p>}

        {genres.length > 0 && (
          <div className="ya-anime-card__genres">
            {genres.map((genre) => (
              <Badge key={genre} tone="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        <dl className="ya-anime-card__meta">
          {anime.episodes != null && (
            <div>
              <dt className="ya-meta-text">Episodes</dt>
              <dd className="ya-body-text">{anime.episodes}</dd>
            </div>
          )}
          {seasonLabel && (
            <div>
              <dt className="ya-meta-text">Season</dt>
              <dd className="ya-body-text">{seasonLabel}</dd>
            </div>
          )}
          {anime.averageScore != null && (
            <div>
              <dt className="ya-meta-text">Score</dt>
              <dd className="ya-body-text ya-anime-card__score">
                <Star size={14} aria-hidden="true" />
                {anime.averageScore}
              </dd>
            </div>
          )}
          {statusLabel && (
            <div>
              <dt className="ya-meta-text">Status</dt>
              <dd className="ya-body-text">{statusLabel}</dd>
            </div>
          )}
        </dl>

        <Button
          variant={addState === 'added' || addState === 'duplicate' ? 'secondary' : 'primary'}
          icon={addState === 'added' || addState === 'duplicate' ? Check : Plus}
          className="ya-anime-card__add-btn"
          onClick={() => onAdd?.(anime)}
          disabled={addState === 'saving' || addState === 'added' || addState === 'duplicate'}
          aria-label={
            addState === 'added'
              ? `${title} added to My Anime`
              : addState === 'duplicate'
                ? `${title} is already in My Anime`
                : `Add ${title} to My Anime`
          }
        >
          {addState === 'saving' && 'Adding...'}
          {addState === 'added' && 'Added ✓'}
          {addState === 'duplicate' && 'Already in My Anime'}
          {(addState === 'idle' || addState === 'error') && 'Add to My Anime'}
        </Button>
        {addState === 'error' && addError && <p className="ya-field__error">{addError}</p>}
      </div>
    </Card>
  )
}

export default AnimeSearchResultCard
