import { useEffect, useRef, useState } from 'react'
import { Star, Tv, X } from 'lucide-react'
import Button from './Button'
import StarRating from './StarRating'
import { addAnimeEntry } from '../services/animeEntries'
import './AddAnimeModal.css'

const CATEGORIES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Romance',
  'Horror',
  'Mystery',
  'Sci-Fi',
  'Sports',
  'Slice of Life',
  'Supernatural',
  'Other',
]

const STATUS_OPTIONS = ['Want to Watch', 'Watching', 'Completed', 'Dropped']

const DESCRIPTION_LIMIT = 500

function AddAnimeModal({ anime, userId, onCancel, onSaved }) {
  const [category, setCategory] = useState('')
  const [rating, setRating] = useState(0)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Want to Watch')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [duplicate, setDuplicate] = useState(false)

  const firstFieldRef = useRef(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !saving) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [saving, onCancel])

  const title = anime.title?.english || anime.title?.romaji || 'Untitled'
  const secondaryTitle =
    anime.title?.english && anime.title?.romaji && anime.title.romaji !== anime.title.english
      ? anime.title.romaji
      : null
  const genres = anime.genres?.slice(0, 4) ?? []

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget && !saving) {
      onCancel()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setError('')
    setDuplicate(false)

    try {
      const saved = await addAnimeEntry(anime, userId, {
        category: category || null,
        rating: rating || null,
        description: description.trim() || null,
        status,
      })
      onSaved(saved)
    } catch (err) {
      if (err.message === 'Already in My Anime') {
        setDuplicate(true)
      } else {
        setError(err.message || 'We could not save this anime right now. Please try again.')
      }
      setSaving(false)
    }
  }

  return (
    <div className="ya-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="ya-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-anime-modal-title"
      >
        <div className="ya-modal__header">
          <h2 id="add-anime-modal-title" className="ya-section-heading">
            Add to My Anime
          </h2>
          <Button
            variant="icon"
            icon={X}
            onClick={() => !saving && onCancel()}
            aria-label="Close Add Anime form"
          />
        </div>

        <div className="ya-modal__preview">
          <div className="ya-modal__preview-cover">
            {anime.coverImage ? (
              <img src={anime.coverImage} alt="" loading="lazy" />
            ) : (
              <div className="ya-modal__preview-cover-fallback" aria-hidden="true">
                <Tv size={24} />
              </div>
            )}
          </div>
          <div className="ya-modal__preview-info">
            <h3 className="ya-section-heading ya-modal__preview-title">{title}</h3>
            {secondaryTitle && <p className="ya-text-muted">{secondaryTitle}</p>}
            {genres.length > 0 && (
              <p className="ya-meta-text ya-modal__preview-genres">{genres.join(' · ')}</p>
            )}
            <div className="ya-modal__preview-meta">
              {anime.averageScore != null && (
                <span className="ya-meta-text ya-modal__preview-score">
                  <Star size={13} aria-hidden="true" />
                  AniList score: {anime.averageScore}
                </span>
              )}
              {anime.episodes != null && (
                <span className="ya-meta-text">{anime.episodes} episodes</span>
              )}
            </div>
          </div>
        </div>

        <form className="ya-modal__form" onSubmit={handleSubmit}>
          <div className="ya-field">
            <label htmlFor="anime-category" className="ya-field__label">
              Category
            </label>
            <select
              id="anime-category"
              ref={firstFieldRef}
              className="ya-input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">No category</option>
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="ya-field">
            <span className="ya-field__label">Your rating</span>
            <p className="ya-meta-text ya-modal__rating-hint">
              Your personal rating — not the AniList score above. Optional.
            </p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="ya-field">
            <label htmlFor="anime-description" className="ya-field__label">
              Description
            </label>
            <textarea
              id="anime-description"
              className="ya-input ya-modal__textarea"
              rows={4}
              maxLength={DESCRIPTION_LIMIT}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Your own notes about this anime (optional)"
            />
            <p className="ya-meta-text ya-modal__char-count">
              {description.length}/{DESCRIPTION_LIMIT}
            </p>
          </div>

          <div className="ya-field">
            <label htmlFor="anime-status" className="ya-field__label">
              Status
            </label>
            <select
              id="anime-status"
              className="ya-input"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {duplicate && <p className="ya-form-alert ya-form-alert--error">Already in My Anime.</p>}
          {error && <p className="ya-field__error">{error}</p>}

          <div className="ya-modal__actions">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save to My Anime'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddAnimeModal
