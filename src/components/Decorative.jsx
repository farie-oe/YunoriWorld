import './Decorative.css'

/** Tiny four-point sparkle, drawn with CSS-friendly SVG. Purely decorative. */
export function Sparkle({ className = '' }) {
  return (
    <svg
      className={`ya-decor-sparkle ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Small decorative heart. Purely ornamental — never used as UI feedback
 * (favouriting etc. still uses the functional Lucide Heart icon). */
export function DecorativeHeart({ className = '' }) {
  return (
    <svg
      className={`ya-decor-heart ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 20.5c-.3 0-.6-.1-.8-.3C7.4 17 3.5 13.6 3.5 9.6 3.5 6.8 5.7 4.5 8.5 4.5c1.4 0 2.7.6 3.5 1.6.8-1 2.1-1.6 3.5-1.6 2.8 0 5 2.3 5 5.1 0 4-3.9 7.4-7.7 10.6-.2.2-.5.3-.8.3z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Simple cherry-blossom silhouette made from overlapping petal shapes. */
export function Blossom({ className = '' }) {
  return (
    <svg
      className={`ya-decor-blossom ${className}`.trim()}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        <circle cx="20" cy="10" r="7" />
        <circle cx="30" cy="17" r="7" />
        <circle cx="26" cy="28" r="7" />
        <circle cx="14" cy="28" r="7" />
        <circle cx="10" cy="17" r="7" />
        <circle cx="20" cy="19" r="4" fill="var(--color-surface)" />
      </g>
    </svg>
  )
}

/** Soft blurred colour blob used as a background accent. Never placed over content. */
export function Blob({ className = '' }) {
  return <span className={`ya-decor-blob ${className}`.trim()} aria-hidden="true" />
}
