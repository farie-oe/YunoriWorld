import { supabase } from '../lib/supabase'

/**
 * Permanently deletes the signed-in user's account by invoking the
 * "delete-account" Supabase Edge Function — the only place with the
 * elevated (service-role) privileges needed to remove the auth.users row
 * and the user's uploaded avatar files, neither of which the frontend can
 * do with its normal anon/publishable credentials. supabase.functions.invoke
 * automatically forwards the caller's own session access token as the
 * Authorization header, and the function re-verifies that token itself, so
 * this always deletes the actual signed-in account — the frontend never
 * supplies a user id. Throws a user-friendly Error on failure, leaving the
 * current session untouched so the user can retry.
 */
export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  })

  if (error || !data?.success) {
    throw new Error('We could not delete your account right now. Please try again.')
  }

  return true
}
