-- CampusBase: AKTU (Dr. A.P.J. Abdul Kalam Technical University, Lucknow) subjects seed. Safe to re-run.
-- Pahile fix_all.sql run kara (subjects.semester column sathi).
-- AKTU madhe branch cha naav "Electronics & Communication (ECE)" ahe — app madhe tyala "E&TC" mhanun ghetle ahe.
-- COVERAGE (kay verify zale): FE (sagle branches), CSE-family (Computer, IT, AI & DS, AI & ML) — core subjects,
-- Mechanical — fakt 4 verified subjects. Civil / Electrical / E&TC / Chemical che 2nd-4th year syllabus PDF milale nahi, mhanun add kele nahit.

-- 1) FE (Sem 1-2) — sagle branches, AKTU common first year
with v(year, sem, name) as (values
  ('FE',1,'Engineering Mathematics-I'),
  ('FE',1,'Professional Communication'),
  ('FE',2,'Engineering Mathematics-II'),
  ('FE',2,'Environment and Ecology'),
  ('FE',null,'Engineering Physics'),
  ('FE',null,'Engineering Chemistry'),
  ('FE',null,'Basic Electrical Engineering'),
  ('FE',null,'Electronics Engineering'),
  ('FE',null,'Programming for Problem Solving'),
  ('FE',null,'Fundamentals of Mechanical Engineering and Mechatronics'),
  ('FE',null,'Engineering Graphics and Design'),
  ('FE',null,'Workshop Practice'),
  ('FE',null,'Soft Skills'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['AI & ML','AI & DS','Computer','IT','Mechanical','Civil','Electrical','E&TC','Chemical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 2) CSE family (Computer, IT, AI & DS, AI & ML) — SE / TE / BE core
with v(year, sem, name) as (values
  ('SE',3,'Data Structures'),
  ('SE',3,'Computer Organization and Architecture'),
  ('SE',3,'Discrete Structures and Theory of Logic'),
  ('SE',3,'Technical Communication'),
  ('SE',4,'Operating Systems'),
  ('SE',4,'Theory of Automata and Formal Languages'),
  ('SE',4,'Object Oriented Techniques using Java'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values and Professional Ethics'),
  ('SE',null,'Python Programming'),
  ('SE',null,'Computer System Security'),
  ('SE',null,'Cyber Security'),
  ('TE',5,'Database Management System'),
  ('TE',5,'Web Technology'),
  ('TE',5,'Design and Analysis of Algorithms'),
  ('TE',5,'Statistical Computing'),
  ('TE',5,'Data Analytics'),
  ('TE',5,'Computer Graphics'),
  ('TE',5,'Object Oriented System Design'),
  ('TE',5,'Machine Learning Techniques'),
  ('TE',5,'Application of Soft Computing'),
  ('TE',5,'Augmented and Virtual Reality'),
  ('TE',5,'Human Computer Interface'),
  ('TE',5,'Constitution of India'),
  ('TE',6,'Software Engineering'),
  ('TE',6,'Compiler Design'),
  ('TE',6,'Computer Networks'),
  ('TE',6,'Big Data'),
  ('TE',6,'Image Processing'),
  ('TE',6,'Real Time Systems'),
  ('TE',6,'Data Compression'),
  ('BE',7,'Artificial Intelligence'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Computer','IT','AI & DS','AI & ML']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 3) Mechanical — fakt verified subjects
with v(year, sem, name) as (values
  ('SE',4,'Applied Thermodynamics'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values and Professional Ethics'),
  ('TE',6,'Refrigeration and Air Conditioning'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Mechanical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;
