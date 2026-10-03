import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import SketchCheckbox from './SketchCheckbox'
import { CATEGORIES } from '../constants/animeOptions'
import './CategoryFilter.css'

function summaryLabel(selected) {
  if (selected.length === 0) return 'All categories'
  if (selected.length === 1) return selected[0]
  return `${selected[0]} +${selected.length - 1}`
}

/**
 * Multi-select category filter for the My Anime filter bar. `selected` is an
 * array of category names; an anime must have ALL of the ticked categories to
 * show, so ticking more narrows the list further.
 */
function CategoryFilter({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggle(name) {
    onChange(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name])
  }

  return (
    <div className="ya-category-filter" ref={rootRef}>
      <button
        type="button"
        className="ya-input ya-category-filter__button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="ya-category-filter__summary">{summaryLabel(selected)}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="ya-category-filter__popover" role="group" aria-label="Filter by category">
          <p className="ya-meta-text ya-category-filter__hint">Shows anime in every ticked category.</p>
          <div className="ya-category-filter__list">
            {CATEGORIES.map((name) => (
              <SketchCheckbox
                key={name}
                label={name}
                checked={selected.includes(name)}
                onChange={() => toggle(name)}
              />
            ))}
          </div>
          {selected.length > 0 && (
            <button type="button" className="ya-category-filter__clear" onClick={() => onChange([])}>
              Clear categories
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CategoryFilter
