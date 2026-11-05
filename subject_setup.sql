-- CampusBase: Subject support. Supabase -> SQL Editor madhe ek vela run kara (safe to re-run).

-- 1) resources.subject
alter table public.resources add column if not exists subject text check (subject is null or char_length(subject) <= 80);
create index if not exists resources_subject_idx on public.resources (university, branch, year, type, subject);

-- 2) subjects list (admin upload page madhe dropdown ithun yeto)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  university text not null,
  branch text not null,
  year text not null,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
create unique index if not exists subjects_uniq on public.subjects (university, branch, year, lower(name));
alter table public.subjects enable row level security;
drop policy if exists "anyone reads subjects" on public.subjects;
create policy "anyone reads subjects" on public.subjects for select using (true);
drop policy if exists "admins insert subjects" on public.subjects;
create policy "admins insert subjects" on public.subjects for insert to authenticated with check (public.is_admin());
drop policy if exists "admins delete subjects" on public.subjects;
create policy "admins delete subjects" on public.subjects for delete to authenticated using (public.is_admin());

-- 3) Already uploaded subjects (jar astil) dropdown madhe automatic yetil
insert into public.subjects (university, branch, year, name)
select distinct university, branch, year, trim(subject) from public.resources
where subject is not null and trim(subject) <> ''
on conflict do nothing;
