// Theme catalogue for Yunori World.
// Each theme only ever changes presentation (CSS variables) — never anime data.
// The actual colour overrides live in src/styles/themes.css under [data-theme="id"].
//
// IDs are kept stable across renames where the underlying palette identity
// is unchanged (e.g. 'default-white', 'sakura-pink') so existing users'
// saved profiles.theme values keep working. Themes that were replaced
// outright (Mint Breeze, Sunset Glow) get new ids, since their palette
// identity no longer exists — a saved reference to the old id falls back
// to the default theme, same as any other unrecognised value.

export const THEMES = [
  {
    id: 'default-white',
    name: 'Ivory White',
    description: 'A clean, near-white foundation with deep text and restrained champagne gold accents.',
    swatches: ['#fcfaf5', '#c9a66b', '#e4dce6', '#f4e3e7'],
  },
  {
    id: 'sakura-pink',
    name: 'Sakura Pink',
    description: 'Soft blush and ivory with champagne gold — refined, not neon.',
    swatches: ['#fff5f7', '#f2a4c1', '#d9b789', '#fdeaf0'],
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Dreamy lavender and violet with subtle celestial accents.',
    swatches: ['#f8f6ff', '#c9b8f0', '#ded4f7', '#b8c9f0'],
  },
  {
    id: 'royal-forest',
    name: 'Royal Forest',
    description: 'Deep emerald and muted sage on ivory, with a touch of gold — elegant and mysterious.',
    swatches: ['#f7f5ee', '#1f4a3a', '#b9c9b0', '#c9a66b'],
  },
  {
    id: 'night-mode',
    name: 'Night Mode',
    description: 'Muted plum darks with soft lavender highlights, comfortable for low light.',
    swatches: ['#201d29', '#7a5c74', '#4a4460', '#3d5570'],
  },
  {
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    description: 'Near-black and charcoal with champagne gold — cinematic and minimal.',
    swatches: ['#100d0a', '#1b1714', '#c9a66b', '#e8d5b0'],
  },
]

export const DEFAULT_THEME_ID = THEMES[0].id
