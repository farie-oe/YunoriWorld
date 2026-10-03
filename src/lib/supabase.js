import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.',
  )
}

// Captured before createClient runs: the client consumes and strips the URL
// hash/query on init, and by then a recovery link is indistinguishable from a
// normal login. Lets the app route recovery sessions to /reset-password
// even if Supabase sends the user to a different path.
const initialUrl = `${window.location.search}${window.location.hash}`
export const startedInRecovery = /type=recovery/.test(initialUrl)

// A reset email opens in a new tab, so the "a reset was requested" marker has
// to live in localStorage. A failed link (expired / already used, e.g. by an
// email scanner) arrives as #error_code=...; Supabase keeps any existing
// session in that case, which would otherwise look like a normal login.
const RESET_REQUESTED_KEY = 'ya-reset-requested'
const RESET_REQUEST_WINDOW_MS = 60 * 60 * 1000

export function markResetRequested() {
  try {
    localStorage.setItem(RESET_REQUESTED_KEY, String(Date.now()))
  } catch {
    // Storage unavailable; the failed-link handling just won't trigger.
  }
}

export function clearResetRequested() {
  try {
    localStorage.removeItem(RESET_REQUESTED_KEY)
  } catch {
    // ignore
  }
}

function resetRequestedRecently() {
  try {
    const at = Number(localStorage.getItem(RESET_REQUESTED_KEY))
    return Boolean(at) && Date.now() - at < RESET_REQUEST_WINDOW_MS
  } catch {
    return false
  }
}

export const startedWithFailedRecoveryLink =
  /error_code=/.test(initialUrl) && resetRequestedRecently()

export const supabase = createClient(supabaseUrl, supabaseKey)
