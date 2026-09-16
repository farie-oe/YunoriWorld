-- YourAnime: profiles table, RLS policies, and auto-provisioning trigger.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use the CLI).

-- 1. Table -------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  unique_id text not null unique,
  theme text not null default 'default',
  created_at timestamptz not null default now()
);

-- 2. Row Level Security --------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy is defined, so profiles cannot be deleted directly by
-- users; they are removed automatically via the ON DELETE CASCADE from
-- auth.users if an account is ever deleted.

-- RLS policies only decide WHICH rows a role can see/change — the role also
-- needs the underlying table privilege, which tables created outside the
-- Supabase Table Editor do not receive automatically. Without this grant,
-- every request from the app (using the anon/publishable key, which becomes
-- the "authenticated" role once a user is logged in) is rejected.
grant select, insert, update on public.profiles to authenticated;

-- 3. Short, user-friendly unique_id generator (e.g. "YA-7K3P2") -----------

create or replace function public.generate_profile_unique_id()
returns text
language plpgsql
as $$
declare
  -- Uppercase letters and digits, minus visually ambiguous characters
  -- (0, O, 1, I) so codes are easy to read back.
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  already_taken boolean;
  i int;
begin
  loop
    candidate := 'YA-';
    for i in 1..5 loop
      candidate := candidate || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    end loop;

    select exists (
      select 1 from public.profiles where unique_id = candidate
    ) into already_taken;

    exit when not already_taken;
  end loop;

  return candidate;
end;
$$;

-- 4. Trigger: auto-create a profile when a new auth user is created -------
-- security definer lets this function insert into public.profiles even
-- though the new user has no session/JWT yet at the moment auth.users is
-- written (this runs entirely server-side, so no service-role key is ever
-- needed or exposed to the frontend).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, unique_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    public.generate_profile_unique_id()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Force PostgREST to pick up the new table/grants immediately -----------
-- Running DDL through the SQL editor does not always trigger PostgREST's
-- automatic schema-cache reload right away, which surfaces to the app as
-- "Could not find the table 'public.profiles' in the schema cache"
-- (PGRST205) even though the table exists. This makes the reload explicit.
notify pgrst, 'reload schema';
