-- CampusBase: Premium band asatana sagle logged-in students la sagle files ughadtil. Ek vela run kara (safe to re-run).

-- 1) Students storage madhun file vachu shaktil (private kiva public donhi bucket madhe chalte)
drop policy if exists "students read all files (premium off)" on storage.objects;
create policy "students read all files (premium off)" on storage.objects
  for select to authenticated using (bucket_id = 'pdfs');

-- 2) Sagle files (junya + navin) free
update public.resources set is_free = true;
alter table public.resources alter column is_free set default true;

-- ===== PREMIUM chalu karayla (jevha tu sangshil) =====
-- a) portal.js madhe:  const PREMIUM_ON=true;
-- b) subscription_setup.sql run kara (bucket private + premium policies), mag:
--    drop policy if exists "students read all files (premium off)" on storage.objects;
--    alter table public.resources alter column is_free set default false;
--    update public.resources set is_free = false;   -- jya files ni free thevaychi nahit tya
