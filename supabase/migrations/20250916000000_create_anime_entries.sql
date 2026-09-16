-- YourAnime: anime_entries table and RLS policies.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use the CLI).

-- 1. Table -------------------------------------------------------------

create table if not exists public.anime_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anilist_id integer not null,
  title text not null,
  cover_image text,
  category text,
  rating integer,
  description text,
  status text,
  favourite boolean not null default false,
  date_added timestamptz not null default now(),
  constraint anime_entries_rating_range check (rating is null or (rating between 1 and 5)),
  constraint anime_entries_status_allowed check (
    status is null or status in ('Want to Watch', 'Watching', 'Completed', 'Dropped')
  ),
  constraint anime_entries_user_anilist_unique unique (user_id, anilist_id)
);

-- 2. Row Level Security --------------------------------------------------

alter table public.anime_entries enable row level security;

drop policy if exists "Anime entries are viewable by their owner" on public.anime_entries;
create policy "Anime entries are viewable by their owner"
  on public.anime_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own anime entries" on public.anime_entries;
create policy "Users can insert their own anime entries"
  on public.anime_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own anime entries" on public.anime_entries;
create policy "Users can update their own anime entries"
  on public.anime_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own anime entries" on public.anime_entries;
create policy "Users can delete their own anime entries"
  on public.anime_entries
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS policies only decide WHICH rows a role can see/change — the role also
-- needs the underlying table privilege, which tables created outside the
-- Supabase Table Editor do not receive automatically. Without this grant,
-- every request from the app (using the anon/publishable key, which becomes
-- the "authenticated" role once a user is logged in) is rejected.
grant select, insert, update, delete on public.anime_entries to authenticated;

-- 3. Force PostgREST to pick up the new table/grants immediately -----------
-- Running DDL through the SQL editor does not always trigger PostgREST's
-- automatic schema-cache reload right away, which surfaces to the app as
-- "Could not find the table 'public.anime_entries' in the schema cache"
-- (PGRST205) even though the table exists. This makes the reload explicit.
notify pgrst, 'reload schema';
