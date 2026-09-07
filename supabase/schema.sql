-- Run once in your own Supabase project's SQL Editor.
-- Public image collection, with writes restricted to explicitly approved editors.
create table public.collection_editors (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.collection_editors enable row level security;
revoke all on public.collection_editors from anon, authenticated;
create function public.is_collection_editor() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.collection_editors where user_id = auth.uid()); $$;
revoke all on function public.is_collection_editor() from public;
grant execute on function public.is_collection_editor() to authenticated;
create table public.photos (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 500),
 url text not null check (url ~ '^https://'),
 rgb integer[] not null check (array_length(rgb,1)=3 and 0 <= all(rgb) and 255 >= all(rgb)),
 width integer check (width > 0),
 height integer check (height > 0),
 source_url text,
 storage_path text,
 arena_id bigint unique,
 created_at timestamptz not null default now()
);
alter table public.photos enable row level security;
grant select on public.photos to anon,authenticated;
grant insert,update,delete on public.photos to authenticated;
create policy "Read collection" on public.photos for select to anon,authenticated using (true);
create policy "Editors add images" on public.photos for insert to authenticated with check (public.is_collection_editor());
create policy "Editors edit images" on public.photos for update to authenticated using (public.is_collection_editor()) with check (public.is_collection_editor());
create policy "Editors remove images" on public.photos for delete to authenticated using (public.is_collection_editor());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('collection','collection',true,15728640,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy "Editors upload files" on storage.objects for insert to authenticated with check (bucket_id='collection' and public.is_collection_editor());
create policy "Editors remove files" on storage.objects for delete to authenticated using (bucket_id='collection' and public.is_collection_editor());
-- After creating your account in Authentication > Users, replace the UUID below:
-- insert into public.collection_editors(user_id) values ('YOUR-AUTH-USER-UUID');
