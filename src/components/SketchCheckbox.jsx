import { forwardRef } from 'react'
import './SketchCheckbox.css'

/**
 * A real <input type="checkbox"> (so keyboard, screen readers and form
 * behaviour are all native) drawn as a wobbly hand-drawn box with a
 * scribbled tick. Purely presentational — it holds no state of its own.
 */
const SketchCheckbox = forwardRef(function SketchCheckbox(
  { label, checked, onChange, disabled = false, id },
  ref,
) {
  return (
    <label className={`ya-check ${disabled ? 'ya-check--disabled' : ''}`.trim()}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="ya-check__input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="ya-check__box" aria-hidden="true">
        <svg className="ya-check__tick" viewBox="0 0 24 24" focusable="false">
          <path d="M4.2 12.6c2.3 1.5 3.9 3.5 5.1 6.3C11.6 12.4 15.2 7.6 20 4.4" />
        </svg>
      </span>
      <span className="ya-check__label">{label}</span>
    </label>
  )
})

export default SketchCheckbox
