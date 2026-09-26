-- Yunori World: track whether the one-time welcome email has been sent.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use
-- the CLI) after 20250919000000_revoke_generate_profile_unique_id_execute.sql.
--
-- This column is the idempotency guard for the "send-welcome-email" Edge
-- Function: it is checked before sending and set immediately after a
-- successful send, so a retried Database Webhook delivery (or any other
-- re-invocation) can never result in a duplicate welcome email. No trigger
-- or webhook is created here — see supabase/functions/send-welcome-email
-- and the project README/PR notes for the Database Webhook configuration,
-- which is set up in the Supabase Dashboard rather than in SQL so its
-- shared secret is never committed to source control.

alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

comment on column public.profiles.welcome_email_sent_at is
  'Set once the one-time "Welcome to Yunori World" email has actually been sent (by the send-welcome-email Edge Function). NULL means it has not been sent yet; used as an idempotency guard against duplicate/retried sends.';

-- RLS / grants: no changes needed. The existing policies on public.profiles
-- already key off auth.uid() = id for select/insert/update, and the
-- existing `grant select, insert, update on public.profiles to
-- authenticated` already covers this new column for normal app use. The
-- send-welcome-email function itself uses the service-role key (bypasses
-- RLS entirely), the same as delete-account already does.

-- Force PostgREST to pick up the new column immediately.
notify pgrst, 'reload schema';
