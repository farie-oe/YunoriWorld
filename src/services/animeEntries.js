import { supabase } from '../lib/supabase'

const UNIQUE_VIOLATION = '23505'

/**
 * Inserts a new anime_entries row for the given user, based on an AniList
 * search result plus the user's completed Add Anime form details. Throws
 * a user-friendly Error on failure, including a distinct message when the
 * anime is already in the user's collection.
 */
export async function addAnimeEntry(anime, userId, details = {}) {
  const title = anime.title?.english || anime.title?.romaji || 'Untitled'

  const { data, error } = await supabase
    .from('anime_entries')
    .insert({
      user_id: userId,
      anilist_id: anime.id,
      title,
      cover_image: anime.coverImage ?? null,
      category: details.category || null,
      rating: details.rating || null,
      description: details.description || null,
      status: details.status || 'Want to Watch',
      favourite: false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw new Error('Already in My Anime')
    }
    throw new Error('We could not add this anime right now. Please try again.')
  }

  return data
}

/**
 * Fetches the authenticated user's saved anime entries, most recently
 * added first. RLS already restricts rows to the given user, but the
 * query also filters by user_id explicitly for clarity.
 */
export async function getAnimeEntries(userId) {
  const { data, error } = await supabase
    .from('anime_entries')
    .select('id, anilist_id, title, cover_image, category, rating, description, status, favourite, date_added')
    .eq('user_id', userId)
    .order('date_added', { ascending: false })

  if (error) {
    throw new Error('We could not load your anime collection right now.')
  }

  return data ?? []
}
