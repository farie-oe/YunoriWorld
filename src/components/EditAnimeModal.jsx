import { useEffect, useRef, useState } from 'react'
import { Tv, X } from 'lucide-react'
import Button from './Button'
import AnimeDetailsFields from './AnimeDetailsFields'
import { updateAnimeEntry } from '../services/animeEntries'
import './AddAnimeModal.css'

function EditAnimeModal({ entry, userId, onCancel, onSaved }) {
  const [category, setCategory] = useState(entry.category || '')
  const [rating, setRating] = useState(entry.rating || 0)
  const [description, setDescription] = useState(entry.description || '')
  const [status, setStatus] = useState(entry.status || 'Want to Watch')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

    try {
      const updated = await updateAnimeEntry(entry.id, userId, {
        category: category || null,
        rating: rating || null,
        description: description.trim() || null,
        status,
      })
      onSaved(updated)
    } catch (err) {
      setError(err.message || 'We could not save your changes right now. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="ya-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="ya-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-anime-modal-title"
      >
        <div className="ya-modal__header">
          <h2 id="edit-anime-modal-title" className="ya-section-heading">
            Edit Anime
          </h2>
          <Button
            variant="icon"
            icon={X}
            onClick={() => !saving && onCancel()}
            aria-label="Close Edit Anime form"
          />
        </div>

        <div className="ya-modal__preview">
          <div className="ya-modal__preview-cover">
            {entry.cover_image ? (
              <img src={entry.cover_image} alt="" loading="lazy" />
            ) : (
              <div className="ya-modal__preview-cover-fallback" aria-hidden="true">
                <Tv size={24} />
              </div>
            )}
          </div>
          <div className="ya-modal__preview-info">
            <h3 className="ya-section-heading ya-modal__preview-title">{entry.title}</h3>
          </div>
        </div>

        <form className="ya-modal__form" onSubmit={handleSubmit}>
          <AnimeDetailsFields
            category={category}
            onCategoryChange={setCategory}
            rating={rating}
            onRatingChange={setRating}
            description={description}
            onDescriptionChange={setDescription}
            status={status}
            onStatusChange={setStatus}
            firstFieldRef={firstFieldRef}
          />

          {error && <p className="ya-field__error">{error}</p>}

          <div className="ya-modal__actions">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAnimeModal
