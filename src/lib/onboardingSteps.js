// Step configuration for the first-time onboarding tutorial (see
// src/hooks/useOnboarding.js and src/components/OnboardingTutorial.jsx).
// Kept separate from the rendering/positioning logic so the copy or flow
// can be edited here without touching how the tour actually works.
//
// `targetId` matches a `data-tour-id` attribute on an existing element
// (see Sidebar.jsx's NAV_ITEMS) — the tour spotlights that real UI element
// rather than inventing a new one. `targetId: null` means the step shows as
// a plain centred card with no spotlight (the welcome/finish steps).
//
// There is no dedicated "Favourites" nav item in Yunori, so that step
// reuses the same 'nav-anime' target as the My Anime step and explains
// favouriting through the My Anime interface instead, per design.
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    heading: 'Welcome to Yunori World',
    text: 'Your personal space to keep track of the anime you love, want to watch, and have completed.',
    targetId: null,
    primaryLabel: "Let's go",
  },
  {
    id: 'dashboard',
    heading: 'Your Dashboard',
    text: 'Get a quick look at your collection, watch list, favourites, and recently added anime.',
    targetId: 'nav-dashboard',
    primaryLabel: 'Next',
  },
  {
    id: 'my-anime',
    heading: 'Build your collection',
    text: 'Search for an anime and add it to your collection. You can keep track of its status, genre, rating, and more.',
    targetId: 'nav-anime',
    primaryLabel: 'Next',
  },
  {
    id: 'watchlist',
    heading: 'Keep track of what you want to watch',
    text: 'Save anime you want to watch later so you always know what is next.',
    targetId: 'nav-watchlist',
    primaryLabel: 'Next',
  },
  {
    id: 'favourites',
    heading: 'Save your favourites',
    text: 'Mark the anime you love as favourites in My Anime so you can find them quickly.',
    targetId: 'nav-anime',
    primaryLabel: 'Next',
  },
  {
    id: 'themes',
    heading: 'Make Yunori yours',
    text: 'Choose a theme to personalise the look of your Yunori World.',
    targetId: 'nav-themes',
    primaryLabel: 'Next',
  },
  {
    id: 'finish',
    heading: "You're all set!",
    text: 'Start building your anime collection and make Yunori World your own.',
    targetId: null,
    primaryLabel: 'Start exploring',
    isFinal: true,
  },
]
