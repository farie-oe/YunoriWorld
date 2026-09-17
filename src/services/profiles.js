import { supabase } from '../lib/supabase'

/**
 * Fetches the profile row for a given auth user id.
 * Returns null if no profile exists yet (e.g. the creation trigger
 * hasn't finished, or the row was never created) rather than throwing.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, unique_id, theme, avatar_type, avatar_value, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return data
}

/**
 * Persists the user's chosen theme to profiles.theme — themes affect
 * presentation only and never touch anime data. Throws a user-friendly
 * Error on failure and returns the updated profile row.
 */
export async function updateProfileTheme(userId, themeId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ theme: themeId })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('We could not save your theme preference right now. Please try again.')
  }

  return data
}

/**
 * Persists the user's chosen display name to profiles.username. This is
 * the only value ever shown as the user's name elsewhere in the app (the
 * Dashboard, PDF export, etc.) — the authenticated email address is never
 * used as a display name. Throws a user-friendly Error on failure and
 * returns the updated profile row.
 */
export async function updateProfileUsername(userId, username) {
  const trimmed = username.trim()

  if (!trimmed) {
    throw new Error('Display name cannot be empty.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ username: trimmed })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('We could not save your display name right now. Please try again.')
  }

  return data
}

/**
 * Persists the user's chosen avatar to profiles.avatar_type /
 * profiles.avatar_value — the single source of truth every avatar
 * rendered in the app (Sidebar, Profile) reads from. avatarType is one of
 * 'default' (no avatar — the placeholder icon is used), 'builtin' (a
 * Yunori avatar; avatarValue is its catalogue id), or 'uploaded'
 * (avatarValue is the caller's own path in the "avatars" Storage bucket).
 * Throws a user-friendly Error on failure and returns the updated profile
 * row.
 */
export async function updateProfileAvatar(userId, { avatarType, avatarValue = null }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_type: avatarType, avatar_value: avatarValue })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('We could not save your avatar right now. Please try again.')
  }

  return data
}
