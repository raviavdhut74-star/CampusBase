-- CampusBase: resources madhe semester. Ek vela run kara (safe to re-run). subjects_dbatu_seed.sql nantar run kara.
alter table public.resources add column if not exists semester smallint check (semester is null or semester between 1 and 8);
create index if not exists resources_semester_idx on public.resources (university, branch, year, semester);

-- Aadhi upload kelelya files cha semester tyanchya subject varun bhara
update public.resources r set semester = s.semester
from public.subjects s
where r.semester is null and s.semester is not null
  and s.university = r.university and s.branch = r.branch and s.year = r.year
  and lower(s.name) = lower(trim(r.subject));
