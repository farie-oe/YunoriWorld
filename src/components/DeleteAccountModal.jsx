import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Button from './Button'
import { deleteAccount } from '../services/account'
import './AddAnimeModal.css'

function DeleteAccountModal({ onCancel, onDeleted }) {
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
      await deleteAccount()
      onDeleted()
    } catch (err) {
      setError(err.message || 'We could not delete your account right now. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="ya-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="ya-modal ya-modal--small"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
        aria-describedby="delete-account-modal-description"
      >
        <div className="ya-modal__header">
          <h2 id="delete-account-modal-title" className="ya-section-heading">
            Delete your account?
          </h2>
        </div>

        <p id="delete-account-modal-description" className="ya-body-text">
          This will permanently delete your Yunori account, including your profile, your entire
          anime collection, and your uploaded avatar. <strong>This cannot be undone.</strong>
        </p>

        {error && <p className="ya-field__error">{error}</p>}

        <div className="ya-modal__actions">
          <Button type="button" variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountModal
