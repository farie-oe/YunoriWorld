-- YourAnime: add avatar selection fields to profiles.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use
-- the CLI) after 20250915000000_create_profiles.sql.

-- 1. Columns -------------------------------------------------------------
-- Two small text columns rather than an image blob: avatar_type tells the
-- app which of the three avatar states applies, and avatar_value carries
-- whatever identifier that state needs — a built-in avatar's catalogue id
-- (e.g. 'yunori'), or an uploaded avatar's path in the "avatars" Storage
-- bucket (see 20250918000100_create_avatar_storage.sql). No binary image
-- data is ever stored in this table.

alter table public.profiles
  add column if not exists avatar_type text not null default 'default',
  add column if not exists avatar_value text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_avatar_type_allowed'
  ) then
    alter table public.profiles
      add constraint profiles_avatar_type_allowed
      check (avatar_type in ('default', 'builtin', 'uploaded'));
  end if;
end $$;

comment on column public.profiles.avatar_type is
  'Which kind of avatar the user has selected: ''default'' (no avatar — the app shows a neutral placeholder), ''builtin'' (one of the built-in Yunori avatars), or ''uploaded'' (a user-uploaded photo in Supabase Storage).';
comment on column public.profiles.avatar_value is
  'The identifier avatar_type needs to resolve the avatar: a built-in avatar''s catalogue id for ''builtin'', or the Storage object path for ''uploaded''. Unused (null) for ''default''.';

-- 2. RLS / grants ----------------------------------------------------------
-- No changes needed: the existing policies on public.profiles already key
-- off auth.uid() = id for select/insert/update, which covers these new
-- columns automatically, and the existing
-- `grant select, insert, update on public.profiles to authenticated`
-- already covers every column on the table.

-- 3. Existing rows -----------------------------------------------------
-- The NOT NULL DEFAULT 'default' above means every existing profile row is
-- backfilled to avatar_type = 'default', avatar_value = null in the same
-- statement — nothing else on the row is touched, and no existing profile
-- fails to load.

-- 4. Force PostgREST to pick up the new columns immediately -----------
notify pgrst, 'reload schema';
