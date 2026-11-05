-- CampusBase: Subject support. Supabase -> SQL Editor madhe ek vela run kara (safe to re-run).
alter table public.resources add column if not exists subject text check (subject is null or char_length(subject) <= 80);
create index if not exists resources_subject_idx on public.resources (university, branch, year, type, subject);
-- Juny files (jyanchya var subject nahi) "General" mhanun distil.
