-- Buckets de Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',         'avatars',         true,  2097152,  array['image/jpeg','image/png','image/webp']),
  ('exercise-media',  'exercise-media',  true,  10485760, array['image/jpeg','image/png','image/webp','image/gif','video/mp4']),
  ('progress-photos', 'progress-photos', false, 8388608,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ── avatars: leitura pública, escrita só na própria pasta ──
create policy "avatars_public_read" on storage.objects
  for select to public using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ── exercise-media: leitura pública, escrita só por service_role ──
create policy "exercise_media_read" on storage.objects
  for select to public using (bucket_id = 'exercise-media');

-- ── progress-photos: 100% privado, só o dono ──
create policy "progress_photos_own" on storage.objects
  for all to authenticated
  using (bucket_id = 'progress-photos'
         and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'progress-photos'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
