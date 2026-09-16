import { supabase } from '../lib/supabase'

/**
 * Fetches the profile row for a given auth user id.
 * Returns null if no profile exists yet (e.g. the creation trigger
 * hasn't finished, or the row was never created) rather than throwing.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, unique_id, theme, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return data
}
