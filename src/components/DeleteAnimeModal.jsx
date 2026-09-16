import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Button from './Button'
import { deleteAnimeEntry } from '../services/animeEntries'
import './AddAnimeModal.css'

function DeleteAnimeModal({ entry, userId, onCancel, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deleting) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleting, onCancel])

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget && !deleting) {
      onCancel()
    }
  }

  async function handleConfirm() {
    if (deleting) return

    setDeleting(true)
    setError('')

    try {
      await deleteAnimeEntry(entry.id, userId)
      onDeleted(entry.id)
    } catch (err) {
      setError(err.message || 'We could not delete this anime right now. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="ya-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="ya-modal ya-modal--small"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-anime-modal-title"
        aria-describedby="delete-anime-modal-description"
      >
        <div className="ya-modal__header">
          <h2 id="delete-anime-modal-title" className="ya-section-heading">
            Remove from My Anime?
          </h2>
        </div>

        <p id="delete-anime-modal-description" className="ya-body-text">
          This will permanently remove <strong>{entry.title}</strong> from your My Anime collection.
          This action cannot be undone from within YourAnime.
        </p>

        {error && <p className="ya-field__error">{error}</p>}

        <div className="ya-modal__actions">
          <Button type="button" variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" icon={Trash2} onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Anime'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAnimeModal
