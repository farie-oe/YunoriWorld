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

/** Thin celestial orbit ring with a small star riding it — used sparingly
 * as an editorial brand mark (e.g. beside the Yunori wordmark), never as
 * a large illustration. */
export function Orbit({ className = '' }) {
  return (
    <svg
      className={`ya-decor-orbit ${className}`.trim()}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <path
        d="M27 8c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8z"
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

/** Small ribbon bow used beside the "Recently Added" heading. Fill follows
 * the theme (--color-primary) and the outline follows --color-outline, so it
 * suits every theme. Purely decorative. */
export function Bow({ className = '' }) {
  return (
    <svg
      className={`ya-decor-bow ${className}`.trim()}
      viewBox="0 0 40 32"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="var(--color-primary)"
        stroke="color-mix(in srgb, var(--color-outline) 45%, var(--color-text))"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M20 16C14 6 5 3 3.5 7.5 2 12 5 24 12 27.5c5 2.5 7-4.5 8-11.5z" />
        <path d="M20 16c6-10 15-13 16.5-8.5C38 12 35 24 28 27.5c-5 2.5-7-4.5-8-11.5z" />
        <circle cx="20" cy="16" r="4.2" fill="var(--color-accent)" />
      </g>
    </svg>
  )
}
