-- YunoriWorld: security hardening — remove public EXECUTE on the internal
-- unique_id generator helper.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use
-- the CLI) after 20250918000100_create_avatar_storage.sql.

-- public.generate_profile_unique_id() (defined in
-- 20250915000000_create_profiles.sql) is only ever meant to be called from
-- inside public.handle_new_user(), a SECURITY DEFINER trigger function.
-- Postgres grants EXECUTE on newly created functions to PUBLIC by default
-- (unlike tables, which default to no access), and no prior migration
-- revoked it, so this function was directly callable via
-- supabase.rpc('generate_profile_unique_id') by anon and authenticated
-- clients. It performs no writes and its internal uniqueness check is
-- already scoped by RLS when called this way, so this was not a data
-- exposure — but it was never intended to be a public API surface. This
-- revoke closes that off without affecting the trigger, since a
-- SECURITY DEFINER function's nested calls run under the definer's
-- privileges regardless of what EXECUTE grants the invoking role holds.

revoke execute on function public.generate_profile_unique_id() from public, anon, authenticated;

-- Force PostgREST to pick up the new grants immediately.
notify pgrst, 'reload schema';
