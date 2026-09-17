-- YourAnime: add a genres column to anime_entries so the Watch List can
-- filter by AniList genre data captured when an anime is saved.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use
-- the CLI) after 20250916000000_create_anime_entries.sql.

alter table public.anime_entries
  add column if not exists genres text[] not null default '{}'::text[];

comment on column public.anime_entries.genres is
  'AniList genres captured when the anime was added to the collection. An anime can have multiple genres. Empty for rows saved before this column existed — never inferred or backfilled, since we have no reliable source for those values without re-querying AniList.';

-- No RLS or grant changes needed: the existing row-level policies on
-- anime_entries key off user_id (not specific columns), and the existing
-- `grant select, insert, update, delete on public.anime_entries to
-- authenticated` from the original migration already covers every column,
-- including this new one.

notify pgrst, 'reload schema';
