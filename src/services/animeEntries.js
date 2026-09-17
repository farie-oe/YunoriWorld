import { supabase } from '../lib/supabase'
import { fetchGenresByAnilistIds } from './anilist'

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
      genres: Array.isArray(anime.genres) ? anime.genres : [],
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
    .select('id, anilist_id, title, cover_image, category, rating, description, status, favourite, genres, date_added')
    .eq('user_id', userId)
    .order('date_added', { ascending: false })

  if (error) {
    throw new Error('We could not load your anime collection right now.')
  }

  return data ?? []
}

/**
 * Backfills the genres column for entries that were saved before that
 * column existed (empty array), by looking their existing anilist_id up on
 * AniList and writing the result back. Only ever updates rows scoped to
 * userId — RLS additionally guarantees a user can only ever change their
 * own rows, so this is safe to call from the client with no elevated
 * credentials, the same way every other anime_entries write in this app
 * works. Entries AniList has no genres for (or whose update fails) are
 * left untouched rather than given an invented value. Returns the rows
 * that were actually updated, so the caller can merge fresh genres into
 * whatever list is already rendered without a full re-fetch.
 */
export async function backfillMissingGenres(entries, userId) {
  const missingGenres = entries.filter((entry) => !entry.genres || entry.genres.length === 0)
  if (missingGenres.length === 0) return []

  let genresByAnilistId
  try {
    genresByAnilistId = await fetchGenresByAnilistIds(missingGenres.map((entry) => entry.anilist_id))
  } catch (err) {
    console.error('Failed to fetch genres from AniList for existing anime:', err)
    return []
  }

  const results = await Promise.allSettled(
    missingGenres
      .filter((entry) => genresByAnilistId[entry.anilist_id]?.length > 0)
      .map(async (entry) => {
        const { data, error } = await supabase
          .from('anime_entries')
          .update({ genres: genresByAnilistId[entry.anilist_id] })
          .eq('id', entry.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return data
      }),
  )

  return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
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
 * Permanently deletes one anime_entries row belonging to the given user.
 * Only removes the user's saved entry — never touches AniList itself.
 * Throws a user-friendly Error on failure.
 */
export async function deleteAnimeEntry(entryId, userId) {
  const { error } = await supabase.from('anime_entries').delete().eq('id', entryId).eq('user_id', userId)

  if (error) {
    throw new Error('We could not delete this anime right now. Please try again.')
  }

  return true
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
    .select('id, anilist_id, title, cover_image, category, rating, description, status, favourite, genres, date_added')
    .eq('user_id', userId)
    .eq('status', 'Want to Watch')
    .order('date_added', { ascending: false })

  if (error) {
    throw new Error('We could not load your watch list right now.')
  }

  return data ?? []
}
