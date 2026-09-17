import { supabase } from '../lib/supabase'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function validateAvatarFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please choose a PNG, JPG, or WEBP image.')
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Please choose an image smaller than 2MB.')
  }
}

/**
 * Uploads (or replaces) the authenticated user's avatar image in the
 * private "avatars" Storage bucket. Every user's file lives at a single
 * fixed path, "<user_id>/avatar" — no extension, so re-uploading in a
 * different format always overwrites the same object instead of leaving
 * orphaned files behind. Storage RLS policies additionally restrict every
 * operation on this bucket to the "<user_id>/..." prefix matching the
 * caller's own auth.uid(), so this is safe to call with the normal
 * anon/publishable client — no service-role key involved.
 */
export async function uploadAvatarImage(userId, file) {
  validateAvatarFile(file)

  const path = `${userId}/avatar`

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type })

  if (error) {
    throw new Error('We could not upload your avatar right now. Please try again.')
  }

  return path
}

/**
 * Produces a short-lived signed URL for an uploaded avatar path. The
 * bucket is private, so this is the only way to render an uploaded avatar
 * — and since the RLS policy scopes storage access to the caller's own
 * auth.uid(), a signed URL can only ever be minted for the signed-in
 * user's own file, never another user's.
 */
export async function getAvatarSignedUrl(path, { expiresInSeconds = 3600 } = {}) {
  if (!path) return null

  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(path, expiresInSeconds)

  if (error) {
    console.error('Failed to create signed avatar URL:', error)
    return null
  }

  return data?.signedUrl ?? null
}
