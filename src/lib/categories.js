import { CATEGORIES } from '../constants/animeOptions'

// An anime can belong to several categories, but anime_entries.category is a
// single text column. Rather than change the database, the selection is kept
// in that same column as a comma-separated list ("Action, Comedy"). A legacy
// single value such as "Action" is just a one-item list, so every existing
// row keeps working untouched. None of the category names contain a comma.

export function parseCategories(value) {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function categoryOrder(name) {
  const index = CATEGORIES.indexOf(name)
  return index === -1 ? CATEGORIES.length : index
}

/** Returns the string to store (or '' for none), in a stable display order. */
export function serializeCategories(list) {
  return [...new Set(list)]
    .sort((a, b) => categoryOrder(a) - categoryOrder(b))
    .join(', ')
}

export function toggleCategory(value, name) {
  const current = parseCategories(value)
  const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
  return serializeCategories(next)
}
