// Yunori World: Supabase Auth "Send Email" HTTPS Hook.
//
// Supabase Auth calls this function directly — server-to-server, never
// from the browser — for every authentication email it needs to send
// (signup confirmation, password recovery, email change, magic link,
// invite, reauthentication) instead of using its own built-in email
// templates. This replaces the earlier Database Webhook approach entirely:
// there is no more auth.users trigger, no old_record/record diffing, no
// email_confirmed_at check, and no profiles.welcome_email_sent_at
// idempotency flag — Supabase's Send Email Hook already calls this exactly
// once per email it needs sent, so none of that bookkeeping is needed here
// any more.
//
// Every request Supabase sends is signed using the Standard Webhooks spec.
// SEND_EMAIL_HOOK_SECRET (the "v1,whsec_..." value Supabase shows you when
// you enable the hook) and RESEND_API_KEY are both Edge Function secrets,
// read via Deno.env.get() — never hardcoded, never logged, never included
// in a response body.
//
// Configure in Supabase Dashboard -> Authentication -> Hooks -> "Send
// Email hook", pointing it at this function's URL, then copy the secret it
// generates into SEND_EMAIL_HOOK_SECRET (see the deploy notes below).
//
// Deploy with: supabase functions deploy send-welcome-email

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const RESEND_FROM_ADDRESS = 'hello@send.yunori.world'

// Plain, Supabase-default-style subjects/messages for every auth email
// type other than signup confirmation, which gets the full Yunori World
// branded design below. These intentionally stay close to what Supabase's
// own built-in templates say, rather than applying the welcome design to
// emails that have nothing to do with welcoming a new user.
const EMAIL_SUBJECTS = {
  recovery: 'Reset your Yunori World password',
  email_change: 'Confirm your new email address',
  magiclink: 'Your Yunori World sign-in link',
  invite: "You've been invited to Yunori World",
  reauthentication: 'Confirm your identity',
}

const EMAIL_MESSAGES = {
  recovery: 'Follow this link to reset your Yunori World password:',
  email_change: 'Follow this link to confirm your new email address:',
  magiclink: 'Follow this link to sign in to Yunori World:',
  invite: 'Follow this link to accept your invitation to Yunori World:',
  reauthentication: 'Follow this link to confirm your identity:',
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Minimal HTML-escaping, used for both the confirmation URL and the one
// piece of user-supplied data (the display name) interpolated into email
// HTML below.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Supabase's Send Email Hook gives you the raw pieces (token_hash, the
// action type, and where to redirect afterwards) rather than a ready-made
// link — this is the same construction Supabase's own docs use to build
// the actual /auth/v1/verify URL the user needs to click.
function buildVerifyUrl(supabaseUrl, tokenHash, actionType, redirectTo) {
  const url = new URL('/auth/v1/verify', supabaseUrl)
  url.searchParams.set('token', tokenHash)
  url.searchParams.set('type', actionType)
  if (redirectTo) url.searchParams.set('redirect_to', redirectTo)
  return url.toString()
}

// The exact Yunori World design — inline CSS only, no external assets, no
// emojis, no extra decoration. `confirmationUrl` must already be
// HTML-escaped by the caller before being passed in here. `username` is
// optional: when present it's inserted into "Your account is ready" so the
// email still reads naturally as a plain sentence when it isn't available.
function buildConfirmationEmailHtml(confirmationUrl, username) {
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

              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
                <tr>
                  <td align="center" style="border-radius:999px; background-color:#5b3b70;">
                    <a href="${confirmationUrl}" style="
                      display:inline-block;
                      padding:14px 32px;
                      color:#f3d7e8;
                      font-size:15px;
                      font-weight:600;
                      text-decoration:none;
                      border-radius:999px;
                    ">
                      Confirm your email
                    </a>
                  </td>
                </tr>
              </table>

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

// Plain fallback for every non-signup auth email — deliberately simple,
// not the branded design above, per Supabase's own default template style.
// `confirmationUrl` must already be HTML-escaped by the caller.
function buildGenericAuthEmailHtml(confirmationUrl, actionType) {
  const message = EMAIL_MESSAGES[actionType] ?? 'Follow this link to continue:'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; color:#24152f;">
  <p style="font-size:15px; line-height:1.6;">${message}</p>
  <p style="font-size:15px; line-height:1.6;"><a href="${confirmationUrl}">${confirmationUrl}</a></p>
  <p style="font-size:12px; color:#6b6b6b;">Yunori World</p>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: { message: 'Method not allowed.' } }, 405)
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')

  if (!hookSecret || !resendApiKey || !supabaseUrl) {
    console.error('send-welcome-email: missing SEND_EMAIL_HOOK_SECRET, RESEND_API_KEY, or SUPABASE_URL.')
    return jsonResponse({ error: { message: 'Server misconfiguration.' } }, 500)
  }

  // The raw body text (not parsed JSON) is required here — signature
  // verification is computed over the exact bytes Supabase sent, and
  // parsing-then-restringifying could produce a different string.
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  let user
  let emailData
  try {
    const wh = new Webhook(hookSecret)
    const verified = wh.verify(payload, headers)
    user = verified.user
    emailData = verified.email_data
  } catch (err) {
    console.error('send-welcome-email: hook signature verification failed:', err.message)
    return jsonResponse({ error: { message: 'Invalid signature.' } }, 401)
  }

  if (!user?.email || !emailData?.token_hash || !emailData?.email_action_type) {
    return jsonResponse({ error: { message: 'Malformed hook payload.' } }, 400)
  }

  const { token_hash: tokenHash, redirect_to: redirectTo, email_action_type: actionType } = emailData
  const confirmationUrl = escapeHtml(buildVerifyUrl(supabaseUrl, tokenHash, actionType, redirectTo))

  let subject
  let html

  if (actionType === 'signup') {
    const username = user.user_metadata?.username ?? null
    subject = 'Welcome to Yunori World'
    html = buildConfirmationEmailHtml(confirmationUrl, username)
  } else {
    subject = EMAIL_SUBJECTS[actionType] ?? 'Yunori World: Confirm your request'
    html = buildGenericAuthEmailHtml(confirmationUrl, actionType)
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_ADDRESS,
      to: user.email,
      subject,
      html,
    }),
  })

  if (!emailResponse.ok) {
    // Logged for diagnosis, but never echoed back to the caller — the
    // response body could in principle include request details, and the
    // Authorization header (the API key) is never part of it regardless.
    const errorBody = await emailResponse.text().catch(() => '')
    console.error('send-welcome-email: Resend request failed:', emailResponse.status, errorBody)
    return jsonResponse({ error: { message: 'Failed to send email.' } }, 500)
  }

  return jsonResponse({}, 200)
})
