-- CampusBase: DBATU (app madhe "BATU") subjects seed.
-- Pahile subject_setup.sql run kara, mag ha file. Safe to re-run (duplicates add hot nahit).

-- 0) semester column (branch page semester-wise cards sathi)
alter table public.subjects add column if not exists semester smallint check (semester is null or semester between 1 and 8);

-- 1) FE (First Year) — sagle branches sathi same 10 subjects
insert into public.subjects (university, branch, year, name)
select 'BATU', b, 'FE', s
from unnest(array['AI & ML','AI & DS','Computer','IT','Mechanical','Civil','Electrical','E&TC','Chemical']) as b,
     unnest(array[
       'Mathematics-I','Engineering Chemistry','Engineering Physics','Mechanics',
       'Basic Civil & Mechanical Engineering','Mathematics-II','Engineering Graphics',
       'Programming','BEEE','Communication'
     ]) as s
on conflict do nothing;

-- 2) SE / TE / BE — AI & ML ani AI & DS (DBATU NEP 2025-26 syllabus PDF madhun)
with v(year, sem, name) as (values
  -- SE (Sem III)
  ('SE',3,'Engineering Mathematics-III'),('SE',3,'Data Structures'),('SE',3,'Discrete Mathematics'),
  ('SE',3,'Artificial Intelligence'),('SE',3,'Prompt Engineering'),('SE',3,'Introduction to Python'),
  ('SE',3,'Open Elective-I'),('SE',3,'Life of Chhatrapati Shivaji Maharaj'),('SE',3,'Universal Human Values-II'),
  ('SE',3,'Data Structures Laboratory with Python'),('SE',3,'Artificial Intelligence Laboratory'),
  -- SE (Sem IV)
  ('SE',4,'Introduction to Operating Systems'),('SE',4,'Data Analytics'),('SE',4,'Probability and Statistics'),
  ('SE',4,'Open Elective-II'),('SE',4,'Full Stack Development'),('SE',4,'Constitution of India'),
  ('SE',4,'Life of Bharat Ratna Dr. Babasaheb Ambedkar'),('SE',4,'Introduction to Operating Systems Laboratory'),
  ('SE',4,'Modern Indian Languages'),('SE',4,'LLM Course with Programming'),
  -- TE (Sem V)
  ('TE',5,'Machine Learning'),('TE',5,'Software Engineering (MLOps)'),('TE',5,'Operating Systems'),
  ('TE',5,'Database Management Systems'),('TE',5,'Vector Databases'),('TE',5,'Human Computer Interaction'),
  ('TE',5,'Computer Graphics'),('TE',5,'Machine Learning Lab'),('TE',5,'MLOps Lab'),
  ('TE',5,'Operating System Laboratory'),('TE',5,'Seminar'),
  -- TE (Sem VI)
  ('TE',6,'Deep Learning'),('TE',6,'Natural Language Processing'),('TE',6,'Computer Vision'),
  ('TE',6,'Data Communication'),('TE',6,'Cyber Physical Systems'),('TE',6,'Open Elective-III'),
  ('TE',6,'Deep Learning Lab'),('TE',6,'NLP Lab'),('TE',6,'Computer Vision Lab'),
  -- BE (Sem VII)
  ('BE',7,'Internet of Things'),('BE',7,'Graphical Neural Networks'),('BE',7,'Quantum Computing'),
  ('BE',7,'Optimization Techniques'),('BE',7,'IoT Lab'),('BE',7,'Project Phase-I'),
  ('BE',7,'Internship'),('BE',7,'Mobile Application Development'),
  -- BE (Sem VIII)
  ('BE',8,'AI Ethics'),('BE',8,'Generative AI'),('BE',8,'AI for Social Good'),
  ('BE',8,'Quantum Machine Learning'),('BE',8,'Business Analytics'),('BE',8,'Learning Analytics'),
  ('BE',8,'Research Methodology'),('BE',8,'Project Phase-II')
)
insert into public.subjects (university, branch, year, name, semester)
select 'BATU', b, v.year, v.name, v.sem
from v cross join unnest(array['AI & ML','AI & DS']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;
