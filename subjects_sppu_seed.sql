-- CampusBase: SPPU (Savitribai Phule Pune University) subjects seed — 2024 Pattern (NEP).
-- Pahile fix_all.sql run kara (subjects.semester column sathi), mag ha file. Safe to re-run.
-- Source: SPPU "First Year Engineering (2024 Pattern)" ani "Second/Third Year (2024 Pattern)" syllabus PDFs.
-- VERIFIED: FE (sagle branches), SE Computer, SE AI&DS / AI&ML, SE E&TC, SE Mechanical (fakt 2 courses), TE AI&DS / AI&ML (Sem V).
-- Baki branches/years sathi syllabus PDF milala ki add karu, kiva admin upload page madhe "＋ New" madhe ek-ek line paste kara.

-- 1) FE — sagle branches
with v(year, sem, name) as (values
  ('FE',1,'Engineering Mathematics-I'),
  ('FE',1,'Fundamentals of Programming Languages'),
  ('FE',1,'Professional Communication Skills'),
  ('FE',2,'Engineering Mathematics-II'),
  ('FE',2,'Programming and Problem Solving'),
  ('FE',2,'Indian Knowledge System'),
  ('FE',null,'Engineering Physics'),
  ('FE',null,'Engineering Chemistry'),
  ('FE',null,'Basic Electronics Engineering'),
  ('FE',null,'Basic Electrical Engineering'),
  ('FE',null,'Engineering Graphics'),
  ('FE',null,'Engineering Mechanics'),
  ('FE',null,'Manufacturing Practice Workshop'),
  ('FE',null,'Design Thinking & Idea Lab'),
  ('FE',null,'Co-Curricular Courses')
)
insert into public.subjects (university, branch, year, name, semester)
select 'SPPU', b, v.year, v.name, v.sem from v
cross join unnest(array['AI & ML','AI & DS','Computer','IT','Mechanical','Civil','Electrical','E&TC','Chemical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 2) SE Computer (Sem III + IV)
with v(year, sem, name) as (values
  ('SE',3,'Data Structures'),
  ('SE',3,'Object Oriented Programming and Computer Graphics'),
  ('SE',3,'Operating Systems'),
  ('SE',3,'Data Structures Laboratory'),
  ('SE',3,'Object Oriented Programming and Computer Graphics Laboratory'),
  ('SE',3,'Digital Electronics and Logic Design'),
  ('SE',3,'Entrepreneurship Development'),
  ('SE',3,'Universal Human Values and Professional Ethics'),
  ('SE',3,'Community Engagement Project'),
  ('SE',3,'Open Elective-I'),
  ('SE',4,'Database Management Systems'),
  ('SE',4,'Discrete Mathematics'),
  ('SE',4,'Computer Organization and Microprocessor'),
  ('SE',4,'Database Management Laboratory'),
  ('SE',4,'Microprocessor Laboratory'),
  ('SE',4,'Internet of Things'),
  ('SE',4,'Web Development'),
  ('SE',4,'Modern Indian Language (Marathi)'),
  ('SE',4,'Engineering Product Design'),
  ('SE',4,'Environmental Studies'),
  ('SE',4,'Open Elective-II')
)
insert into public.subjects (university, branch, year, name, semester)
select 'SPPU', b, v.year, v.name, v.sem from v cross join unnest(array['Computer']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 3) AI & DS and AI & ML  (SE Sem III/IV + TE Sem V)
with v(year, sem, name) as (values
  ('SE',3,'Data Structures'),
  ('SE',3,'Artificial Intelligence'),
  ('SE',3,'Operating System'),
  ('SE',3,'Data Structures Laboratory'),
  ('SE',3,'Artificial Intelligence Laboratory'),
  ('SE',3,'Digital Electronics and Logic Design'),
  ('SE',3,'Entrepreneurship Development'),
  ('SE',3,'Universal Human Values and Professional Ethics'),
  ('SE',3,'Community Engagement Project'),
  ('SE',3,'Open Elective-I'),
  ('SE',4,'Database Management System'),
  ('SE',4,'Data Science'),
  ('SE',4,'Probability and Statistics'),
  ('SE',4,'Open Elective-II'),
  ('TE',5,'Networks and Security'),
  ('TE',5,'Machine Learning'),
  ('TE',5,'Natural Language Processing'),
  ('TE',5,'Natural Language Processing Laboratory'),
  ('TE',5,'Machine Learning Laboratory'),
  ('TE',5,'Elective I - Blockchain'),
  ('TE',5,'Elective I - Cloud Computing')
)
insert into public.subjects (university, branch, year, name, semester)
select 'SPPU', b, v.year, v.name, v.sem from v cross join unnest(array['AI & DS','AI & ML']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 4) E&TC (SE Sem III + IV)
with v(year, sem, name) as (values
  ('SE',3,'Electronics Circuits'),
  ('SE',3,'Engineering Mathematics III'),
  ('SE',3,'Digital Electronics'),
  ('SE',3,'Electronics Circuits & Digital Electronics Lab'),
  ('SE',3,'Community Engagement Project'),
  ('SE',3,'Open Elective-I'),
  ('SE',4,'Communication Engineering'),
  ('SE',4,'Signals and Systems'),
  ('SE',4,'Control Systems'),
  ('SE',4,'Communication Engineering Lab'),
  ('SE',4,'Object Oriented Programming'),
  ('SE',4,'Open Elective-II')
)
insert into public.subjects (university, branch, year, name, semester)
select 'SPPU', b, v.year, v.name, v.sem from v cross join unnest(array['E&TC']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 5) Mechanical (SE) — fakt verified courses
with v(year, sem, name) as (values
  ('SE',3,'Engineering Thermodynamics'),
  ('SE',4,'Fluid Mechanics')
)
insert into public.subjects (university, branch, year, name, semester)
select 'SPPU', b, v.year, v.name, v.sem from v cross join unnest(array['Mechanical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;
