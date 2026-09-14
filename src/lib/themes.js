// Theme catalogue for YourAnime.
// Each theme only ever changes presentation (CSS variables) — never anime data.
// The actual colour overrides live in src/styles/themes.css under [data-theme="id"].

export const THEMES = [
  {
    id: 'default-white',
    name: 'Default White Kawaii',
    description: 'Warm white and cream with soft pink and lavender accents.',
    swatches: ['#fffbf6', '#f3b8cb', '#d9cff0', '#bfe0f2'],
  },
  {
    id: 'sakura-pink',
    name: 'Sakura Pink',
    description: 'A blush-forward palette inspired by cherry blossoms.',
    swatches: ['#fff5f7', '#f2a4c1', '#f7cede', '#e6b8d1'],
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Cool lavender tones for a dreamy, calm journal feel.',
    swatches: ['#f8f6ff', '#c9b8f0', '#ded4f7', '#b8c9f0'],
  },
  {
    id: 'mint-breeze',
    name: 'Mint Breeze',
    description: 'Fresh pastel mint and cream, light and airy.',
    swatches: ['#f5fbf8', '#a8dfc9', '#cdeee1', '#bfe0f2'],
  },
  {
    id: 'night-mode',
    name: 'Night Mode',
    description: 'Muted plum darks for comfortable low-light viewing.',
    swatches: ['#221f2b', '#7a5c74', '#4a4460', '#3d5570'],
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm peach and coral tones for a cosy evening vibe.',
    swatches: ['#fff6ee', '#f2b088', '#f6cf9c', '#e8a3a3'],
  },
]

export const DEFAULT_THEME_ID = THEMES[0].id
