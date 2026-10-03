import { useEffect, useRef, useState } from 'react'
import { X, Upload, RotateCcw } from 'lucide-react'
import Button from './Button'
import Avatar from './Avatar'
import { CLASSIC_AVATARS, POSE_AVATARS } from '../lib/avatars'
import { updateProfileAvatar } from '../services/profiles'
import { uploadAvatarImage, validateAvatarFile } from '../services/avatarStorage'
import './AvatarPickerModal.css'

const AVATAR_SECTIONS = [
  { label: 'Yunori Avatars', avatars: CLASSIC_AVATARS },
  { label: 'Yunori Poses', avatars: POSE_AVATARS },
]

function AvatarPickerModal({ userId, currentAvatarType, currentAvatarValue, onCancel, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !saving) onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [saving, onCancel])

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget && !saving) onCancel()
  }

  async function handleSelectBuiltIn(avatarId) {
    if (saving) return
    setSaving(true)
    setError('')

    try {
      const updated = await updateProfileAvatar(userId, { avatarType: 'builtin', avatarValue: avatarId })
      onSaved(updated)
    } catch (err) {
      setError(err.message || 'We could not save your avatar right now. Please try again.')
      setSaving(false)
    }
  }

  async function handleUseDefault() {
    if (saving) return
    setSaving(true)
    setError('')

    try {
      const updated = await updateProfileAvatar(userId, { avatarType: 'default', avatarValue: null })
      onSaved(updated)
    } catch (err) {
      setError(err.message || 'We could not save your avatar right now. Please try again.')
      setSaving(false)
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      validateAvatarFile(file)
    } catch (err) {
      setError(err.message)
      return
    }

    setError('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUploadSave() {
    if (!selectedFile || saving) return
    setSaving(true)
    setError('')

    try {
      const path = await uploadAvatarImage(userId, selectedFile)
      const updated = await updateProfileAvatar(userId, { avatarType: 'uploaded', avatarValue: path })
      onSaved(updated)
    } catch (err) {
      setError(err.message || 'We could not upload your avatar right now. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="ya-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="ya-modal ya-avatar-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
      >
        <div className="ya-modal__header">
          <h2 id="avatar-picker-title" className="ya-section-heading">
            Choose Avatar
          </h2>
          <Button
            variant="icon"
            icon={X}
            onClick={() => !saving && onCancel()}
            aria-label="Close avatar picker"
          />
        </div>

        {AVATAR_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="ya-eyebrow ya-avatar-picker__section-label">{section.label}</p>
            <div className="ya-avatar-picker__grid">
              {section.avatars.map((avatar) => {
                const isSelected = currentAvatarType === 'builtin' && currentAvatarValue === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`ya-avatar-picker__option ${isSelected ? 'ya-avatar-picker__option--selected' : ''}`}
                    onClick={() => handleSelectBuiltIn(avatar.id)}
                    disabled={saving}
                    aria-pressed={isSelected}
                  >
                    <Avatar avatarType="builtin" avatarValue={avatar.id} size={56} />
                    <span className="ya-meta-text">{avatar.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <p className="ya-eyebrow ya-avatar-picker__section-label">Upload Your Own</p>
        <div className="ya-avatar-picker__upload">
          {previewUrl && (
            <span className="ya-avatar-picker__preview">
              <img src={previewUrl} alt="" />
            </span>
          )}
          <div className="ya-avatar-picker__upload-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="ya-visually-hidden"
              onChange={handleFileChange}
              id="avatar-file-input"
              aria-label="Choose a photo to upload"
            />
            <Button
              type="button"
              variant="outline"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              {selectedFile ? 'Choose Different Photo' : 'Choose Photo'}
            </Button>
            {selectedFile && (
              <Button type="button" onClick={handleUploadSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Photo'}
              </Button>
            )}
          </div>
          <p className="ya-meta-text">PNG, JPG, or WEBP. Max 2MB.</p>
        </div>

        {error && <p className="ya-field__error">{error}</p>}

        {currentAvatarType !== 'default' && (
          <Button
            type="button"
            variant="outline"
            icon={RotateCcw}
            onClick={handleUseDefault}
            disabled={saving}
            className="ya-avatar-picker__reset"
          >
            Use Default
          </Button>
        )}
      </div>
    </div>
  )
}

export default AvatarPickerModal
