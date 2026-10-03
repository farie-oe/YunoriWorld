// Maps an anime status to the Badge tone used everywhere a status label is
// shown (dashboard, My Anime, Watch List, details), so a status always has
// the same colour regardless of page.
const STATUS_TONES = {
  'Want to Watch': 'blue',
  Watching: 'green',
  Completed: 'pink',
  Dropped: 'neutral',
}

export function statusTone(status) {
  return STATUS_TONES[status] ?? 'blue'
}
