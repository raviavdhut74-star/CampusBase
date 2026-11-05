-- CampusBase: DBATU (app madhe "BATU") subjects seed.
-- Pahile subject_setup.sql run kara, mag ha file. Safe to re-run (duplicates add hot nahit).

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
with v(year, name) as (values
  -- SE (Sem III)
  ('SE','Engineering Mathematics-III'),('SE','Data Structures'),('SE','Discrete Mathematics'),
  ('SE','Artificial Intelligence'),('SE','Prompt Engineering'),('SE','Introduction to Python'),
  ('SE','Open Elective-I'),('SE','Life of Chhatrapati Shivaji Maharaj'),('SE','Universal Human Values-II'),
  ('SE','Data Structures Laboratory with Python'),('SE','Artificial Intelligence Laboratory'),
  -- SE (Sem IV)
  ('SE','Introduction to Operating Systems'),('SE','Data Analytics'),('SE','Probability and Statistics'),
  ('SE','Open Elective-II'),('SE','Full Stack Development'),('SE','Constitution of India'),
  ('SE','Life of Bharat Ratna Dr. Babasaheb Ambedkar'),('SE','Introduction to Operating Systems Laboratory'),
  ('SE','Modern Indian Languages'),('SE','LLM Course with Programming'),
  -- TE (Sem V)
  ('TE','Machine Learning'),('TE','Software Engineering (MLOps)'),('TE','Operating Systems'),
  ('TE','Database Management Systems'),('TE','Vector Databases'),('TE','Human Computer Interaction'),
  ('TE','Computer Graphics'),('TE','Machine Learning Lab'),('TE','MLOps Lab'),
  ('TE','Operating System Laboratory'),('TE','Seminar'),
  -- TE (Sem VI)
  ('TE','Deep Learning'),('TE','Natural Language Processing'),('TE','Computer Vision'),
  ('TE','Data Communication'),('TE','Cyber Physical Systems'),('TE','Open Elective-III'),
  ('TE','Deep Learning Lab'),('TE','NLP Lab'),('TE','Computer Vision Lab'),
  -- BE (Sem VII)
  ('BE','Internet of Things'),('BE','Graphical Neural Networks'),('BE','Quantum Computing'),
  ('BE','Optimization Techniques'),('BE','IoT Lab'),('BE','Project Phase-I'),
  ('BE','Internship'),('BE','Mobile Application Development'),
  -- BE (Sem VIII)
  ('BE','AI Ethics'),('BE','Generative AI'),('BE','AI for Social Good'),
  ('BE','Quantum Machine Learning'),('BE','Business Analytics'),('BE','Learning Analytics'),
  ('BE','Research Methodology'),('BE','Project Phase-II')
)
insert into public.subjects (university, branch, year, name)
select 'BATU', b, v.year, v.name
from v cross join unnest(array['AI & ML','AI & DS']) as b
on conflict do nothing;
