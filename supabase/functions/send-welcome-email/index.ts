// Yunori World: sends the one-time "Welcome to Yunori World" email via
// Resend, triggered by a Supabase Database Webhook on auth.users UPDATE.
//
// This function is never called from the frontend — it is only ever
// invoked server-side by the Database Webhook configured in the Supabase
// Dashboard (Database -> Webhooks: auth.users, UPDATE). Because that
// webhook fires on EVERY update to auth.users (including things that
// happen on every login, like last_sign_in_at), this function's first job
// is to work out whether this particular update is genuinely "the user
// just confirmed their email for the first time" and bail out (as a
// harmless no-op) for anything else.
//
// Both secrets below (RESEND_API_KEY and WEBHOOK_SECRET) are Edge Function
// secrets, set via `supabase secrets set` — never committed to source
// control and never reachable from the browser.
//
// Deploy with: supabase functions deploy send-welcome-email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const RESEND_FROM_ADDRESS = 'hello@send.yunori.world'

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Minimal HTML-escaping for the one piece of user-supplied data (the
// display name) interpolated into the email HTML below.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// The exact Yunori World welcome email design — inline CSS only, no
// external assets, no emojis. `username` is optional: when present it's
// inserted into "Your account is ready" so the email still reads naturally
// (as a plain sentence) when it isn't available.
function buildWelcomeEmailHtml(username) {
  const readyLine = username ? `Your account is ready, ${escapeHtml(username)}.` : 'Your account is ready.'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Yunori World</title>
</head>

<body style="margin:0; padding:0; background-color:#24152f; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#24152f;">
    <tr>
      <td align="center" style="padding:50px 20px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px; background-color:#352044; border:1px solid #5b3b70; border-radius:24px;">

          <tr>
            <td align="center" style="padding:42px 38px;">

              <div style="
                color:#f3d7e8;
                font-size:25px;
                font-weight:600;
                letter-spacing:0.3px;
                margin-bottom:32px;
              ">
                Yunori World
              </div>

              <h1 style="
                margin:0 0 18px 0;
                color:#ffffff;
                font-size:28px;
                line-height:1.3;
                font-weight:600;
              ">
                Welcome to Yunori World
              </h1>

              <p style="
                margin:0 0 22px 0;
                color:#d9cce0;
                font-size:16px;
                line-height:1.7;
              ">
                ${readyLine}
              </p>

              <p style="
                margin:0 0 28px 0;
                color:#d9cce0;
                font-size:16px;
                line-height:1.7;
              ">
                Before starting your anime collection, take a moment to make
                Yunori World your own. Keep track of the anime you love,
                discover new favourites, and build your collection your way.
              </p>

              <div style="
                width:100%;
                height:1px;
                background-color:#5b3b70;
                margin:28px 0;
              "></div>

              <p style="
                margin:0;
                color:#f3d7e8;
                font-size:14px;
                line-height:1.6;
              ">
                Your anime collection starts here.
              </p>

              <p style="
                margin:30px 0 0 0;
                color:#9d8baa;
                font-size:12px;
              ">
                Yunori World
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  // Verify this request genuinely came from our own Database Webhook, not
  // an arbitrary caller — webhook requests carry no user JWT (there's no
  // "calling user"; Postgres itself is the caller), so a shared secret
  // configured as a custom header on the webhook is the auth mechanism
  // here, checked against the same value stored as an Edge Function secret.
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  const providedSecret = (req.headers.get('x-webhook-secret') ?? '').trim()
  if (!webhookSecret || providedSecret !== webhookSecret) {
    return jsonResponse({ error: 'Unauthorized.' }, 401)
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!resendApiKey || !supabaseUrl || !serviceRoleKey) {
    console.error('send-welcome-email: missing RESEND_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.')
    return jsonResponse({ error: 'Server misconfiguration.' }, 500)
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400)
  }

  const newRow = payload?.record
  const oldRow = payload?.old_record

  if (!newRow?.id || !newRow?.email) {
    return jsonResponse({ error: 'Malformed webhook payload.' }, 400)
  }

  // The one condition this entire function exists to check: only a genuine
  // NULL -> timestamp transition on email_confirmed_at means "the user just
  // confirmed their email for the first time." Every other auth.users
  // update (last_sign_in_at on every login, etc.) is a harmless no-op here,
  // and importantly returns 200 rather than an error so the webhook doesn't
  // keep retrying something there was never anything to do for.
  const justConfirmed = !oldRow?.email_confirmed_at && Boolean(newRow.email_confirmed_at)
  if (!justConfirmed) {
    return jsonResponse({ success: true, skipped: 'not a confirmation transition' }, 200)
  }

  const userId = newRow.id

  // Service-role client: bypasses RLS, used only server-side, exactly as
  // delete-account already does for its own admin operations.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Idempotency guard: if this user's welcome email was already sent
  // (e.g. a retried webhook delivery for the same confirmation event),
  // do nothing. This is checked again immediately before sending, and the
  // flag is set right after a successful send, so the window for a
  // duplicate is as small as it can practically be.
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('username, welcome_email_sent_at')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('send-welcome-email: failed to load profile:', profileError)
    return jsonResponse({ error: 'Could not load profile.' }, 500)
  }

  if (profile?.welcome_email_sent_at) {
    return jsonResponse({ success: true, skipped: 'already sent' }, 200)
  }

  // Prefer profiles.username (the canonical, possibly-edited display name);
  // fall back to the raw signup metadata if the profile row isn't available
  // yet for some reason.
  const username = profile?.username || newRow.raw_user_meta_data?.username || null

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_ADDRESS,
      to: newRow.email,
      subject: 'Welcome to Yunori World',
      html: buildWelcomeEmailHtml(username),
    }),
  })

  if (!emailResponse.ok) {
    const errorBody = await emailResponse.text().catch(() => '')
    console.error('send-welcome-email: Resend request failed:', emailResponse.status, errorBody)
    return jsonResponse({ error: 'Failed to send welcome email.' }, 502)
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq('id', userId)

  if (updateError) {
    // The email has already gone out at this point — log loudly, but this
    // is not something to report as a failure to the webhook (retrying
    // would just resend the email, which is exactly what this flag exists
    // to prevent).
    console.error('send-welcome-email: sent email but failed to record welcome_email_sent_at:', updateError)
  }

  return jsonResponse({ success: true }, 200)
})
