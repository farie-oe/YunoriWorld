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

/**
 * Updates the editable fields (category, rating, description, status) of
 * one existing anime_entries row belonging to the given user. AniList id,
 * title, cover image, user_id, and date_added are never touched here.
 * Throws a user-friendly Error on failure and returns the updated row.
 */
export async function updateAnimeEntry(entryId, userId, updates) {
  const { data, error } = await supabase
    .from('anime_entries')
    .update({
      category: updates.category || null,
      rating: updates.rating || null,
      description: updates.description || null,
      status: updates.status || 'Want to Watch',
    })
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('We could not save your changes right now. Please try again.')
  }

  return data
}

/**
 * Sets the favourite flag on one existing anime_entries row belonging to
 * the given user. Throws a user-friendly Error on failure and returns the
 * updated row.
 */
export async function updateAnimeFavourite(entryId, userId, favourite) {
  const { data, error } = await supabase
    .from('anime_entries')
    .update({ favourite })
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('We could not update your favourite right now. Please try again.')
  }

  return data
}

/**
 * Fetches the authenticated user's anime entries whose status is
 * 'Want to Watch' — the Watch List is a filtered view of anime_entries,
 * not a separate collection. RLS already restricts rows to the given
 * user, but the query also filters by user_id explicitly for clarity.
 */
export async function getWatchList(userId) {
  const { data, error } = await supabase
    .from('anime_entries')
    .select('id, anilist_id, title, cover_image, category, rating, description, status, favourite, date_added')
    .eq('user_id', userId)
    .eq('status', 'Want to Watch')
    .order('date_added', { ascending: false })

  if (error) {
    throw new Error('We could not load your watch list right now.')
  }

  return data ?? []
}
