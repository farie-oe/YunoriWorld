-- Yunori World: pre-launch hardening (field tampering, server-side input
-- limits, upload limits).
--
-- NOT applied automatically. Review it, then run it in the Supabase SQL editor
-- (or `supabase db push`). It is written to be safe to re-run.
--
-- Nothing here changes what the app does for a normal signed-in user: every
-- column the app edits is still editable, and every value the app writes
-- already satisfies the limits below. It only closes doors that the browser
-- UI never opened but a hand-written API call could.

-- 1. Block field tampering ----------------------------------------------
-- The existing RLS policies say a user may update THEIR OWN ROW, but not
-- WHICH COLUMNS. So today a user could, from the browser console, overwrite
-- profiles.unique_id (impersonate another member's Yunori ID) or
-- profiles.welcome_email_sent_at (re-trigger / suppress the welcome email), or
-- rewrite an anime entry's cover_image, title or date_added.
--
-- Column-level privileges fix that: RLS still decides which rows, and these
-- grants decide which columns. The app only ever updates the columns listed
-- (see src/services/profiles.js and src/services/animeEntries.js). The Edge
-- Functions use the service-role key, which bypasses these grants, so the
-- welcome-email flag and account deletion keep working.

revoke update on public.profiles from authenticated, anon;
grant update (username, theme, avatar_type, avatar_value)
  on public.profiles to authenticated;

revoke update on public.anime_entries from authenticated, anon;
grant update (category, rating, description, status, favourite, genres)
  on public.anime_entries to authenticated;

-- 2. Server-side input limits ---------------------------------------------
-- These limits already exist in the browser forms, but a browser check can be
-- skipped by calling the API directly. Added as NOT VALID so any row already
-- in the table (even one that predates the rule) cannot block the migration;
-- the rule is still enforced for every new insert and update. To also check
-- old rows, run the "validate constraint" statements at the bottom once you
-- are happy there is no legacy data that breaks them.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_username_length') then
    alter table public.profiles
      add constraint profiles_username_length
      check (char_length(btrim(username)) between 3 and 40) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_theme_length') then
    alter table public.profiles
      add constraint profiles_theme_length
      check (char_length(theme) <= 40) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_value_length') then
    alter table public.profiles
      add constraint profiles_avatar_value_length
      check (avatar_value is null or char_length(avatar_value) <= 200) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'anime_entries_title_length') then
    alter table public.anime_entries
      add constraint anime_entries_title_length
      check (char_length(title) between 1 and 300) not valid;
  end if;

  -- DESCRIPTION_LIMIT in src/constants/animeOptions.js is 500.
  if not exists (select 1 from pg_constraint where conname = 'anime_entries_description_length') then
    alter table public.anime_entries
      add constraint anime_entries_description_length
      check (description is null or char_length(description) <= 500) not valid;
  end if;

  -- category holds a comma-separated list of the 13 fixed category names.
  if not exists (select 1 from pg_constraint where conname = 'anime_entries_category_length') then
    alter table public.anime_entries
      add constraint anime_entries_category_length
      check (category is null or char_length(category) <= 300) not valid;
  end if;

  -- Cover art always comes from AniList over https; refusing anything else
  -- keeps javascript:/data:/http: URLs out of an <img src>.
  if not exists (select 1 from pg_constraint where conname = 'anime_entries_cover_image_https') then
    alter table public.anime_entries
      add constraint anime_entries_cover_image_https
      check (cover_image is null
             or (cover_image ~ '^https://' and char_length(cover_image) <= 2000)) not valid;
  end if;
end
$$;

-- 3. Server-side upload limits ----------------------------------------------
-- The 2 MB size and PNG/JPEG/WEBP checks in src/services/avatarStorage.js run
-- in the browser only. Setting them on the bucket makes Supabase Storage
-- enforce them itself.
update storage.buckets
   set file_size_limit = 2097152,
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
 where id = 'avatars';

notify pgrst, 'reload schema';

-- 4. Optional, run later once you have checked your existing data ------------
-- alter table public.profiles       validate constraint profiles_username_length;
-- alter table public.profiles       validate constraint profiles_theme_length;
-- alter table public.profiles       validate constraint profiles_avatar_value_length;
-- alter table public.anime_entries  validate constraint anime_entries_title_length;
-- alter table public.anime_entries  validate constraint anime_entries_description_length;
-- alter table public.anime_entries  validate constraint anime_entries_category_length;
-- alter table public.anime_entries  validate constraint anime_entries_cover_image_https;
