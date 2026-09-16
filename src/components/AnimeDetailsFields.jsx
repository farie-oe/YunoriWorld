import StarRating from './StarRating'
import { CATEGORIES, STATUS_OPTIONS, DESCRIPTION_LIMIT } from '../constants/animeOptions'

/**
 * The shared editable fields used by both the Add Anime and Edit Anime
 * forms: category, personal rating, description, and status.
 */
function AnimeDetailsFields({
  category,
  onCategoryChange,
  rating,
  onRatingChange,
  description,
  onDescriptionChange,
  status,
  onStatusChange,
  firstFieldRef,
}) {
  return (
    <>
      <div className="ya-field">
        <label htmlFor="anime-category" className="ya-field__label">
          Category
        </label>
        <select
          id="anime-category"
          ref={firstFieldRef}
          className="ya-input"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
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
          Your personal rating — not the AniList score. Optional.
        </p>
        <StarRating value={rating} onChange={onRatingChange} />
        {rating > 0 && (
          <button
            type="button"
            className="ya-modal__clear-rating"
            onClick={() => onRatingChange(0)}
          >
            Clear rating
          </button>
        )}
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
          onChange={(event) => onDescriptionChange(event.target.value)}
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
          onChange={(event) => onStatusChange(event.target.value)}
          required
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export default AnimeDetailsFields
