import { useState } from 'react'
import { Star } from 'lucide-react'
import './StarRating.css'

const MAX_STARS = 5

/**
 * Visual-only star rating (1-5). Never renders a numeric score.
 * Pass `onChange` to make it interactive (e.g. a rating form field).
 */
function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  const [hovered, setHovered] = useState(0)
  const interactive = Boolean(onChange) && !readOnly
  const displayValue = hovered || value

  return (
    <div
      className={`ya-star-rating ${interactive ? 'ya-star-rating--interactive' : ''}`}
      role="img"
      aria-label={`Rated ${value} out of ${MAX_STARS} stars`}
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const starValue = index + 1
        const filled = starValue <= displayValue

        const star = (
          <Star
            key={starValue}
            size={size}
            className={`ya-star-rating__star ${filled ? 'ya-star-rating__star--filled' : ''}`}
            aria-hidden="true"
          />
        )

        if (!interactive) return star

        return (
          <button
            key={starValue}
            type="button"
            className="ya-star-rating__button"
            aria-label={`Set rating to ${starValue} star${starValue > 1 ? 's' : ''}`}
            onMouseEnter={() => setHovered(starValue)}
            onFocus={() => setHovered(starValue)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(starValue)}
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
