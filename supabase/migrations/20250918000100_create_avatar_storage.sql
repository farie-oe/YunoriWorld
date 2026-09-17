-- YourAnime: Supabase Storage bucket + policies for user-uploaded avatars.
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use
-- the CLI) after 20250918000000_add_avatar_to_profiles.sql.

-- 1. Bucket ----------------------------------------------------------------
-- Private (public = false): an uploaded avatar is only ever readable via a
-- short-lived signed URL minted for the requesting user (see
-- getAvatarSignedUrl in src/services/avatarStorage.js), never a permanent
-- public URL — so another user cannot simply guess/share a link to it.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- 2. Row Level Security ------------------------------------------------
-- Every avatar is stored at "<user_id>/avatar" (see uploadAvatarImage in
-- src/services/avatarStorage.js). storage.foldername(name) splits an
-- object's path into its folder segments, so (storage.foldername(name))[1]
-- is that leading "<user_id>" segment. Restricting every operation to rows
-- where that segment equals the caller's own auth.uid() means a signed-in
-- user can only ever read, create, replace, or delete their own avatar —
-- never another user's — the same ownership pattern already used for
-- anime_entries and profiles.

drop policy if exists "Avatar images are managed by their owner" on storage.objects;
create policy "Avatar images are managed by their owner"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- No service-role key is used or needed anywhere in the app — uploads,
-- reads, and replacements all happen through this policy with the normal
-- anon/publishable client once a user is signed in.

-- 3. Force PostgREST to pick up the new bucket/policies immediately -----
notify pgrst, 'reload schema';
