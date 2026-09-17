-- Run once in the Supabase SQL Editor for this project.
-- Meal metadata stays in the versioned static dataset. Supabase stores images only.

create table if not exists public.collection_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.collection_editors enable row level security;
revoke all on public.collection_editors from anon, authenticated;

create or replace function public.is_collection_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.collection_editors
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_collection_editor() from public;
grant execute on function public.is_collection_editor() to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  '265',
  '265',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic']
)
on conflict (id) do update set public = true;

create policy "Public reads 265 meal images"
on storage.objects for select
to anon, authenticated
using (bucket_id = '265');

create policy "Editors upload 265 meal images"
on storage.objects for insert
to authenticated
with check (bucket_id = '265' and public.is_collection_editor());

create policy "Editors update 265 meal images"
on storage.objects for update
to authenticated
using (bucket_id = '265' and public.is_collection_editor())
with check (bucket_id = '265' and public.is_collection_editor());

create policy "Editors remove 265 meal images"
on storage.objects for delete
to authenticated
using (bucket_id = '265' and public.is_collection_editor());

-- After creating an editor in Authentication > Users, add their UUID once:
-- insert into public.collection_editors(user_id) values ('YOUR-AUTH-USER-UUID');
