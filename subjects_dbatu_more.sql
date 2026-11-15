-- CampusBase: DBATU (app madhe 'BATU') — aankhi subjects. Pahile fix_all.sql ani subjects_dbatu_seed.sql run kara. Safe to re-run.
-- Hya file madhe fakt tech ahe je DBATU chya syllabus madhe verify zale.
-- Aadhi already add zalele: FE (sagle branches) + AI & ML / AI & DS (SE -> BE, tu dilelya PDF varun).
-- BAAKI (E&TC, Electrical, Chemical, IT, Mechanical cha uravlela bhag, Civil/Computer che TE/BE): official DBATU NEP PDF milala ki add karu.

-- 1) Computer — DBATU NEP Computer Engineering & Allied, Second Year (Sem III + IV)
with v(year, sem, name) as (values
  ('SE',3,'Engineering Mathematics-III'),
  ('SE',3,'Data Structures'),
  ('SE',3,'Discrete Mathematics'),
  ('SE',3,'Object-Oriented Programming'),
  ('SE',4,'Design and Analysis of Algorithms'),
  ('SE',4,'Computer Architecture and Organization'),
  ('SE',4,'Operating Systems Laboratory'),
  ('SE',null,'Full Stack Development Project'))
insert into public.subjects (university, branch, year, name, semester)
select 'BATU', b, v.year, v.name, v.sem from v cross join unnest(array['Computer']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 2) Civil — DBATU SY scheme (2021-22 / 2022-23 pasun chalu asleli) Sem III + IV; NEP batch sathi naave vegli asu shaktat
with v(year, sem, name) as (values
  ('SE',3,'Mathematics-III'),
  ('SE',3,'Mechanics of Solids'),
  ('SE',3,'Hydraulics I'),
  ('SE',3,'Surveying I'),
  ('SE',4,'Building Planning and Drawing'),
  ('SE',4,'Environmental Engineering'),
  ('SE',4,'Structural Mechanics-I'),
  ('TE',6,'Traffic Engineering & Management'))
insert into public.subjects (university, branch, year, name, semester)
select 'BATU', b, v.year, v.name, v.sem from v cross join unnest(array['Civil']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 3) Mechanical — fakt verified
with v(year, sem, name) as (values
  ('SE',3,'Engineering Mathematics-III'),
  ('SE',3,'Thermodynamics'))
insert into public.subjects (university, branch, year, name, semester)
select 'BATU', b, v.year, v.name, v.sem from v cross join unnest(array['Mechanical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;
