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

export const supabase = createClient(supabaseUrl, supabaseKey)
