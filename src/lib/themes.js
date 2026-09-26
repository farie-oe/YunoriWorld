// Theme catalogue for Yunori World.
// Each theme only ever changes presentation (CSS variables) — never anime data.
// The actual colour overrides live in src/styles/themes.css under [data-theme="id"]
// (except 'warm-ivory', which matches the plain :root defaults in global.css).
//
// Every theme is paired 1:1 with one of the built-in Yunori avatars
// (src/lib/avatars.js) via avatarId — the Themes page renders that avatar
// as the way to pick the theme, rather than a swatch/colour-picker card.
// `glow` is the one colour used to tint the brief transition effect when
// switching to that theme (see ThemeProvider's THEME_TRANSITION_MS).
//
// IDs are kept stable across renames where the underlying palette identity
// is unchanged (e.g. 'sakura-pink'). A saved profiles.theme value that no
// longer matches any id here (e.g. from before this catalogue was
// reorganised around the avatar collection) simply falls back to
// DEFAULT_THEME_ID, the same as any other unrecognised value.

export const THEMES = [
  { id: 'sakura-pink', name: 'Soft White', avatarId: 'yunori', glow: '#c98fa7' },
  { id: 'midnight-lavender', name: 'Midnight Lavender', avatarId: 'luna', glow: '#a78bd6' },
  { id: 'blossom-pink', name: 'Blossom Pink', avatarId: 'hana', glow: '#e8779b' },
  { id: 'forest-green', name: 'Forest Green', avatarId: 'mori', glow: '#1f4a3a' },
  { id: 'neon-play', name: 'Neon Play', avatarId: 'pixel', glow: '#34b8a6' },
  { id: 'celestial-blue', name: 'Celestial Blue', avatarId: 'cosmo', glow: '#6f9ce8' },
  { id: 'warm-ivory', name: 'Warm Ivory', avatarId: 'sora', glow: '#c9a66b' },
  { id: 'crimson-night', name: 'Crimson Night', avatarId: 'kage', glow: '#b3384a' },
]

export const DEFAULT_THEME_ID = 'warm-ivory'
