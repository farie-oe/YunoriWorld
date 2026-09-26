// YourAnime / Yunori: permanently deletes the calling user's account.
//
// This is the only place in the app that ever uses the Supabase
// service-role key — it is read from an Edge Function secret at runtime
// and never sent to, or reachable from, the browser. The frontend calls
// this function via supabase.functions.invoke('delete-account'), which
// automatically forwards the caller's own session access token as the
// Authorization header; this function re-verifies that token itself
// (auth.getUser) and always deletes the id it decodes from it — the
// request body is never trusted for "who to delete", so the frontend has
// no way to ask this function to delete another user's account.
//
// Deploy with: supabase functions deploy delete-account
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically
// in the Edge Function runtime — no manual secret configuration needed.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!jwt) {
    return jsonResponse({ error: 'Missing authorization token.' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('delete-account: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
    return jsonResponse({ error: 'Server misconfiguration.' }, 500)
  }

  // Service-role client: full privileges (bypasses RLS), used only
  // server-side for the two operations below.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Verify identity from the caller's own token — this is the sole source
  // of the user id used below.
  const { data: userData, error: userError } = await admin.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return jsonResponse({ error: 'Could not verify your session. Please log in again.' }, 401)
  }
  const userId = userData.user.id

  // 1. Remove this user's uploaded avatar file(s) from the private
  // "avatars" bucket first, while deletion can still fail safely without
  // having touched the Auth account. Every uploaded avatar lives under the
  // "<user_id>/" folder (see uploadAvatarImage in
  // src/services/avatarStorage.js); built-in Yunori avatars are static
  // frontend assets, never Storage objects, so they can never be affected
  // here.
  const { data: files, error: listError } = await admin.storage.from('avatars').list(userId)
  if (listError) {
    console.error('delete-account: failed to list avatar files:', listError)
    return jsonResponse({ error: 'We could not delete your account right now. Please try again.' }, 500)
  }

  if (files && files.length > 0) {
    const paths = files.map((file) => `${userId}/${file.name}`)
    const { error: removeError } = await admin.storage.from('avatars').remove(paths)
    if (removeError) {
      console.error('delete-account: failed to remove avatar files:', removeError)
      return jsonResponse({ error: 'We could not delete your account right now. Please try again.' }, 500)
    }
  }

  // 2. Delete the Auth user. Both public.profiles.id and
  // public.anime_entries.user_id reference auth.users(id) ON DELETE
  // CASCADE, so this single call also removes the user's profile row and
  // every anime_entries row — no separate table deletes are needed (or
  // safe to attempt afterwards, since the referenced auth user would
  // already be gone).
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('delete-account: failed to delete auth user:', deleteError)
    return jsonResponse({ error: 'We could not delete your account right now. Please try again.' }, 500)
  }

  return jsonResponse({ success: true }, 200)
})
