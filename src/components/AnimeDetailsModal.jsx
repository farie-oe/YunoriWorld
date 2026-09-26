import { useEffect, useState } from 'react'
import { Heart, Tv, X } from 'lucide-react'
import Button from './Button'
import Badge from './Badge'
import StarRating from './StarRating'
import { getAnimeDetails } from '../services/anilist'
import './AddAnimeModal.css'
import './AnimeDetailsModal.css'

// AniList's description(asHtml: false) still leaves inline tags (e.g. <i>,
// <br>) in some entries, so tags are stripped and entities decoded here
// regardless — the synopsis must never show raw markup to the user.
function stripHtml(html) {
  if (!html) return ''

  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function truncateSynopsis(text, maxSentences = 2, maxChars = 220) {
  if (!text) return ''

  const clean = stripHtml(text).replace(/\s+/g, ' ').trim()
  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean]
  let result = sentences.slice(0, maxSentences).join(' ').trim()

  if (result.length > maxChars) {
    const truncated = result.slice(0, maxChars)
    const lastSpace = truncated.lastIndexOf(' ')
    result = `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`
  }

  return result
}

/**
 * Reusable read-only "view details" modal for a saved anime entry. Opened
 * from any card that displays a user's anime (Dashboard, My Anime, Watch
 * List, Favourites) via a shared `onView(entry)` prop, so there is exactly
 * one details UI instead of a per-page copy. The entry itself only carries
 * the user's saved data (title, cover, genres, rating, status, favourite);
 * synopsis and streaming availability live on AniList, so this component
 * fetches them by anilist_id when it opens and simply omits anything
 * AniList doesn't have rather than guessing.
 */
function AnimeDetailsModal({ entry, onClose }) {
  const [details, setDetails] = useState(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    let cancelled = false

    if (!Number.isInteger(entry.anilist_id)) {
      return undefined
    }

    getAnimeDetails(entry.anilist_id)
      .then((result) => {
        if (!cancelled) setDetails(result)
      })
      .catch(() => {
        // Synopsis/streaming are enhancements on top of the saved entry —
        // if AniList can't be reached, the modal still shows what we have.
      })

    return () => {
      cancelled = true
    }
  }, [entry.anilist_id])

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) onClose()
  }

  const genres = entry.genres?.length ? entry.genres : details?.genres || []
  const synopsis = truncateSynopsis(details?.description)
  const streamingLinks = details?.streamingLinks || []

  return (
    <div className="ya-modal-overlay ya-details-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="ya-modal ya-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="anime-details-modal-title"
      >
        <Button
          variant="icon"
          icon={X}
          onClick={onClose}
          aria-label="Close anime details"
          className="ya-details-modal__close"
        />

        <div className="ya-details-modal__cover">
          {entry.cover_image ? (
            <img src={entry.cover_image} alt="" loading="lazy" />
          ) : (
            <div className="ya-details-modal__cover-fallback" aria-hidden="true">
              <Tv size={32} />
            </div>
          )}
        </div>

        <div className="ya-details-modal__body">
          <h2 id="anime-details-modal-title" className="ya-section-heading ya-details-modal__title">
            {entry.title}
          </h2>

          <div className="ya-details-modal__meta-row">
            <Badge tone="primary">{entry.status || 'Want to Watch'}</Badge>
            {entry.favourite && (
              <Badge tone="accent" className="ya-details-modal__favourite-badge">
                <Heart size={12} fill="currentColor" aria-hidden="true" />
                Favourite
              </Badge>
            )}
          </div>

          {entry.rating != null && entry.rating > 0 && (
            <StarRating value={entry.rating} readOnly size={18} />
          )}

          {genres.length > 0 && (
            <div className="ya-details-modal__genres">
              {genres.map((genre) => (
                <Badge key={genre} tone="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {synopsis && <p className="ya-text-muted ya-details-modal__synopsis">{synopsis}</p>}

          {streamingLinks.length > 0 && (
            <div className="ya-details-modal__streaming">
              <span className="ya-text-muted ya-details-modal__streaming-label">Available on</span>
              <div className="ya-details-modal__streaming-list">
                {streamingLinks.map((link) => {
                  const icon = <img src={link.icon} alt={link.site || 'Streaming platform'} loading="lazy" />
                  const chipStyle = link.color ? { backgroundColor: link.color } : undefined

                  return link.url ? (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ya-details-modal__streaming-item"
                      style={chipStyle}
                      aria-label={link.site || 'Watch on streaming platform'}
                      title={link.site}
                    >
                      {icon}
                    </a>
                  ) : (
                    <span
                      key={link.id}
                      className="ya-details-modal__streaming-item"
                      style={chipStyle}
                      aria-label={link.site || 'Streaming platform'}
                      title={link.site}
                    >
                      {icon}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnimeDetailsModal
