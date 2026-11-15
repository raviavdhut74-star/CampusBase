-- CampusBase: AKTU (Dr. A.P.J. Abdul Kalam Technical University, Lucknow) subjects seed — v2. Safe to re-run.
-- Pahile fix_all.sql run kara. University = 'AKTU'.
-- Source: AKTU K-series scheme (course codes KCS/KIT/KEE/KEC/KME/KCE/KCH). "E&TC" = AKTU cha "Electronics & Communication (ECE)".
-- Aadhicha seed chuka hota (Web Technology / Compiler Design che semester ulte hote) mhanun ha sagla navin ghalto:
delete from public.subjects where university = 'AKTU' and year in ('SE','TE','BE');

-- 1) FE — sagle branches
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

-- 2) Computer (CSE) — SE/TE/BE
with v(year, sem, name) as (values
  ('SE',3,'Data Structures'),
  ('SE',3,'Computer Organization and Architecture'),
  ('SE',3,'Discrete Structures & Theory of Logic'),
  ('SE',3,'Technical Communication'),
  ('SE',3,'Data Structures Using C Lab'),
  ('SE',3,'Computer Organization Lab'),
  ('SE',3,'Discrete Structure & Logic Lab'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values'),
  ('SE',4,'Operating Systems'),
  ('SE',4,'Theory of Automata and Formal Languages'),
  ('SE',4,'Operating Systems Lab'),
  ('SE',null,'Computer System Security'),
  ('SE',null,'Python Programming'),
  ('SE',4,'Microprocessor'),
  ('SE',4,'Microprocessor Lab'),
  ('TE',5,'Database Management System'),
  ('TE',5,'Design and Analysis of Algorithm'),
  ('TE',5,'Web Designing'),
  ('TE',5,'Computer Graphics'),
  ('TE',5,'Machine Learning Techniques'),
  ('TE',5,'Human Computer Interface'),
  ('TE',5,'Constitution of India, Law and Engineering'),
  ('TE',6,'Software Engineering'),
  ('TE',6,'Computer Networks'),
  ('TE',6,'Big Data'),
  ('TE',6,'Image Processing'),
  ('TE',6,'Real Time Systems'),
  ('TE',6,'Data Compression'),
  ('TE',6,'Software Project Management'),
  ('BE',7,'Artificial Intelligence'),
  ('BE',8,'Quality Management'),
  ('BE',null,'Project Management & Entrepreneurship'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Computer']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 3) AI & ML, AI & DS — AKTU madhe CSE (AI&ML) / CSE (DS) cha core CSE sarkhach; ithe CSE chi list vaparli ahe
with v(year, sem, name) as (values
  ('SE',3,'Data Structures'),
  ('SE',3,'Computer Organization and Architecture'),
  ('SE',3,'Discrete Structures & Theory of Logic'),
  ('SE',3,'Technical Communication'),
  ('SE',3,'Data Structures Using C Lab'),
  ('SE',3,'Computer Organization Lab'),
  ('SE',3,'Discrete Structure & Logic Lab'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values'),
  ('SE',4,'Operating Systems'),
  ('SE',4,'Theory of Automata and Formal Languages'),
  ('SE',4,'Operating Systems Lab'),
  ('SE',null,'Computer System Security'),
  ('SE',null,'Python Programming'),
  ('SE',4,'Microprocessor'),
  ('SE',4,'Microprocessor Lab'),
  ('TE',5,'Database Management System'),
  ('TE',5,'Design and Analysis of Algorithm'),
  ('TE',5,'Web Designing'),
  ('TE',5,'Computer Graphics'),
  ('TE',5,'Machine Learning Techniques'),
  ('TE',5,'Human Computer Interface'),
  ('TE',5,'Constitution of India, Law and Engineering'),
  ('TE',6,'Software Engineering'),
  ('TE',6,'Computer Networks'),
  ('TE',6,'Big Data'),
  ('TE',6,'Image Processing'),
  ('TE',6,'Real Time Systems'),
  ('TE',6,'Data Compression'),
  ('TE',6,'Software Project Management'),
  ('BE',7,'Artificial Intelligence'),
  ('BE',8,'Quality Management'),
  ('BE',null,'Project Management & Entrepreneurship'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['AI & ML','AI & DS']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 4) IT
with v(year, sem, name) as (values
  ('SE',3,'Data Structures'),
  ('SE',3,'Computer Organization and Architecture'),
  ('SE',3,'Discrete Structures & Theory of Logic'),
  ('SE',3,'Technical Communication'),
  ('SE',3,'Data Structures Using C Lab'),
  ('SE',3,'Computer Organization Lab'),
  ('SE',3,'Discrete Structure & Logic Lab'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values'),
  ('SE',4,'Operating Systems'),
  ('SE',4,'Theory of Automata and Formal Languages'),
  ('SE',4,'Operating Systems Lab'),
  ('SE',null,'Computer System Security'),
  ('SE',null,'Python Programming'),
  ('TE',5,'Database Management System'),
  ('TE',5,'Web Technology'),
  ('TE',5,'Design and Analysis of Algorithm'),
  ('TE',5,'Constitution of India, Law and Engineering'),
  ('TE',6,'Software Engineering'),
  ('TE',6,'Data Analytics'),
  ('TE',6,'Computer Networks'),
  ('TE',6,'Big Data'),
  ('TE',6,'Software Project Management'),
  ('BE',7,'Artificial Intelligence'),
  ('BE',8,'Quality Management'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['IT']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 5) Mechanical
with v(year, sem, name) as (values
  ('SE',3,'Thermodynamics'),
  ('SE',3,'Fluid Mechanics & Fluid Machines'),
  ('SE',3,'Materials Engineering'),
  ('SE',3,'Technical Communication'),
  ('SE',3,'Fluid Mechanics Lab'),
  ('SE',3,'Material Testing Lab'),
  ('SE',3,'Computer Aided Machine Drawing-I Lab'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values'),
  ('SE',4,'Applied Thermodynamics'),
  ('SE',4,'Engineering Mechanics'),
  ('SE',4,'Manufacturing Processes'),
  ('SE',4,'Applied Thermodynamics Lab'),
  ('TE',5,'Heat and Mass Transfer'),
  ('TE',5,'Strength of Material'),
  ('TE',5,'Industrial Engineering'),
  ('TE',5,'Advance Welding'),
  ('TE',5,'Constitution of India, Law and Engineering'),
  ('TE',6,'Refrigeration and Air Conditioning'),
  ('TE',6,'Machine Design'),
  ('TE',6,'Theory of Machine'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Mechanical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 6) Civil
with v(year, sem, name) as (values
  ('SE',3,'Engineering Mechanics'),
  ('SE',3,'Surveying and Geomatics'),
  ('SE',3,'Fluid Mechanics'),
  ('SE',3,'Technical Communication'),
  ('SE',3,'Building Planning & Drawing Lab'),
  ('SE',3,'Surveying and Geomatics Lab'),
  ('SE',4,'Mathematics-III'),
  ('SE',4,'Universal Human Values'),
  ('SE',4,'Materials, Testing & Construction Practices'),
  ('SE',4,'Introduction to Solid Mechanics'),
  ('SE',4,'Hydraulic Engineering and Machines'),
  ('SE',4,'Material Testing Lab'),
  ('SE',4,'Solid Mechanics Lab'),
  ('SE',4,'Hydraulics & Hydraulic Machine Lab'),
  ('TE',5,'Geotechnical Engineering'),
  ('TE',5,'Structural Analysis'),
  ('TE',5,'Quantity Estimation and Construction Management'),
  ('TE',5,'Concrete Technology'),
  ('TE',5,'Engineering Hydrology'),
  ('TE',5,'Air and Noise Pollution Control'),
  ('TE',5,'River Engineering'),
  ('TE',5,'CAD Lab'),
  ('TE',6,'Environmental Engineering'),
  ('TE',6,'Foundation Engineering'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Civil']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 7) Electrical
with v(year, sem, name) as (values
  ('SE',3,'Electromagnetic Field Theory'),
  ('SE',3,'Electrical Measurements & Instrumentation'),
  ('SE',3,'Basic Signals & Systems'),
  ('SE',3,'Universal Human Values'),
  ('SE',3,'Analog Electronics Lab'),
  ('SE',3,'Electrical Measurement and Instrument Lab'),
  ('SE',3,'Electrical Workshop'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Technical Communication'),
  ('SE',4,'Digital Electronics'),
  ('SE',4,'Electrical Machines-I'),
  ('SE',4,'Network Analysis & Synthesis'),
  ('SE',4,'Circuit Simulation Lab'),
  ('SE',4,'Electrical Machines-I Lab'),
  ('SE',4,'Digital Electronics Lab'),
  ('SE',4,'Computer System Security'),
  ('TE',5,'Power System-I'),
  ('TE',5,'Control System'),
  ('TE',5,'Electrical Machines-II'),
  ('TE',5,'Industrial Automation and Control'),
  ('TE',5,'Analog & Digital Communication'),
  ('TE',5,'Sensors and Transducers'),
  ('TE',5,'Neural Networks & Fuzzy System'),
  ('TE',5,'Power System-I Lab'),
  ('TE',5,'Control System Lab'),
  ('TE',5,'Electrical Machine-II Lab'),
  ('TE',5,'Constitution of India, Law and Engineering'),
  ('TE',6,'Power System-II'),
  ('TE',6,'Microprocessor and Microcontroller'),
  ('TE',6,'Power Electronics'),
  ('TE',6,'Special Electrical Machines'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Electrical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 8) E&TC (= AKTU ECE)
with v(year, sem, name) as (values
  ('SE',3,'Electronic Devices'),
  ('SE',3,'Digital System Design'),
  ('SE',3,'Network Analysis and Synthesis'),
  ('SE',3,'Technical Communication'),
  ('SE',3,'Electronics Devices Lab'),
  ('SE',3,'Digital System Design Lab'),
  ('SE',4,'Mathematics-IV'),
  ('SE',4,'Universal Human Values'),
  ('SE',4,'Communication Engineering'),
  ('SE',4,'Analog Circuits'),
  ('SE',4,'Signal System'),
  ('SE',4,'Communication Engineering Lab'),
  ('TE',5,'Integrated Circuits'),
  ('TE',5,'Microprocessor & Microcontroller'),
  ('TE',5,'Electronics Switching'),
  ('TE',5,'Advance Semiconductor Device'),
  ('TE',5,'Electronics Measurement & Instrumentation'),
  ('TE',5,'Optical Communication'),
  ('TE',5,'Constitution of India, Law and Engineering'),
  ('TE',6,'Digital Communication'),
  ('TE',6,'Microcontroller & Embedded System Design Lab'),
  ('BE',7,'Digital Image Processing'),
  ('BE',7,'Wireless Mobile Communication'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['E&TC']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;

-- 9) Chemical
with v(year, sem, name) as (values
  ('SE',3,'Material and Energy Balance'),
  ('SE',3,'Chemical Engineering Fluid Mechanics'),
  ('SE',3,'Heat Transfer Operations'),
  ('SE',3,'Chemical Engineering Fluid Mechanics Lab'),
  ('SE',4,'Mechanical Operations'),
  ('SE',4,'Chemical Reaction Engineering-I'),
  ('SE',4,'Chemical Engineering Thermodynamics'),
  ('SE',4,'Chemical Reaction Engineering Lab'),
  ('SE',4,'Numerical Methods of Analysis Lab'),
  ('TE',5,'Mass Transfer-I'),
  ('TE',5,'Computational Fluid Dynamics'),
  ('TE',5,'Optimization Techniques'),
  ('TE',5,'Numerical Methods for Chemical Engineers'))
insert into public.subjects (university, branch, year, name, semester)
select 'AKTU', b, v.year, v.name, v.sem from v cross join unnest(array['Chemical']) as b
on conflict (university, branch, year, lower(name)) do update set semester = excluded.semester;
