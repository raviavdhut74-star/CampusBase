-- CampusBase: ek-shot fix. Supabase -> SQL Editor madhe PURN paste karun ek vela run kara (safe to re-run).
-- Shevti "Results" madhe tuze files kontya University/Branch/Year/Semester madhe ahet te dist-il.

-- 1) resources madhe sagle navin columns (missing asatil tar upload fail hot hote)
alter table public.resources add column if not exists subject  text;
alter table public.resources add column if not exists semester smallint check (semester is null or semester between 1 and 8);
alter table public.resources add column if not exists is_free  boolean not null default false;
create index if not exists resources_lookup_idx on public.resources (university, branch, year, semester);

-- 2) subjects table (admin upload + student subject boxes)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  university text not null, branch text not null, year text not null,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.subjects add column if not exists semester smallint check (semester is null or semester between 1 and 8);
create unique index if not exists subjects_uniq on public.subjects (university, branch, year, lower(name));
alter table public.subjects enable row level security;
drop policy if exists "anyone reads subjects" on public.subjects;
create policy "anyone reads subjects" on public.subjects for select using (true);
drop policy if exists "admins insert subjects" on public.subjects;
create policy "admins insert subjects" on public.subjects for insert to authenticated with check (public.is_admin());
drop policy if exists "admins delete subjects" on public.subjects;
create policy "admins delete subjects" on public.subjects for delete to authenticated using (public.is_admin());

-- 3) University / Branch / Year che naav ekach format madhe aana (junya files + student profiles)
create or replace function public.canon_uni(v text) returns text language sql immutable as $$
  select case
    when upper(btrim(v)) in ('BATU','DBATU','DR. BATU','DR BATU') then 'BATU'
    when upper(btrim(v)) like 'SPPU%' or upper(btrim(v)) like 'PUNE UNIVERSITY%' then 'SPPU'
    when upper(btrim(v)) in ('SGBBU','SGBAU','SGBAU AMRAVATI') then 'SGBBU'
    when upper(btrim(v)) = 'AKTU' then 'AKTU'
    else btrim(v) end $$;
create or replace function public.canon_branch(v text) returns text language sql immutable as $$
  select case
    when upper(regexp_replace(btrim(v),'\s+','','g')) in ('AIML','AI&ML','AIANDML','AI&MACHINELEARNING','ARTIFICIALINTELLIGENCE&MACHINELEARNING') then 'AI & ML'
    when upper(regexp_replace(btrim(v),'\s+','','g')) in ('AIDS','AI&DS','AIANDDS','AI&DATASCIENCE','ARTIFICIALINTELLIGENCE&DATASCIENCE') then 'AI & DS'
    when upper(btrim(v)) in ('COMPUTER','COMPUTER ENGINEERING','COMPUTER SCIENCE','CSE','COMP') then 'Computer'
    when upper(btrim(v)) in ('IT','INFORMATION TECHNOLOGY') then 'IT'
    when upper(btrim(v)) in ('MECHANICAL','MECHANICAL ENGINEERING','MECH') then 'Mechanical'
    when upper(btrim(v)) in ('CIVIL','CIVIL ENGINEERING') then 'Civil'
    when upper(btrim(v)) in ('ELECTRICAL','ELECTRICAL ENGINEERING') then 'Electrical'
    when upper(regexp_replace(btrim(v),'\s+','','g')) in ('E&TC','ENTC','EXTC','ELECTRONICS&TELECOMMUNICATION') then 'E&TC'
    when upper(btrim(v)) in ('CHEMICAL','CHEMICAL ENGINEERING') then 'Chemical'
    else btrim(v) end $$;
create or replace function public.canon_year(v text) returns text language sql immutable as $$
  select case
    when upper(btrim(v)) in ('FE','FY','FIRST YEAR','1ST YEAR') then 'FE'
    when upper(btrim(v)) in ('SE','SY','SECOND YEAR','2ND YEAR') then 'SE'
    when upper(btrim(v)) in ('TE','TY','THIRD YEAR','3RD YEAR') then 'TE'
    when upper(btrim(v)) in ('BE','LY','FINAL YEAR','FOURTH YEAR','4TH YEAR') then 'BE'
    else upper(btrim(v)) end $$;

update public.resources set university = canon_uni(university), branch = canon_branch(branch), year = canon_year(year), type = btrim(type), subject = nullif(btrim(subject),'');
update public.profiles  set university = canon_uni(university), branch = canon_branch(branch), year = canon_year(year) where university is not null or branch is not null or year is not null;

-- navin uploads pan automatic ekach format madhe save hotil
create or replace function public.resources_normalize() returns trigger language plpgsql as $$
begin
  new.university := canon_uni(new.university); new.branch := canon_branch(new.branch); new.year := canon_year(new.year);
  new.subject := nullif(btrim(new.subject),'');
  return new;
end $$;
drop trigger if exists resources_normalize on public.resources;
create trigger resources_normalize before insert or update on public.resources for each row execute function public.resources_normalize();

-- 4) Students la sagle files ughadtil (premium hava asel tar admin upload madhe untick kara)
update public.resources set is_free = true;

-- 5) Junya files cha semester tyanchya subject varun bhara
update public.resources r set semester = s.semester
from public.subjects s
where r.semester is null and s.semester is not null
  and s.university = r.university and s.branch = r.branch and s.year = r.year
  and lower(s.name) = lower(r.subject);

-- 6) RESULT: files kuthe save ahet (student cha University/Branch/Year yacha shi match zala pahije)
select university, branch, year, semester, count(*) as files
from public.resources group by 1,2,3,4 order by 1,2,3,4;
