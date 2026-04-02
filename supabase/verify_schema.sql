-- Verify all tables exist with correct columns
select
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('components','units','topics','questions','student_answers')
order by table_name, ordinal_position;

-- Verify foreign key constraints
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name  as foreign_table,
  ccu.column_name as foreign_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in ('units','topics','questions','student_answers')
order by tc.table_name;

-- Verify indexes
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('components','units','topics','questions','student_answers')
order by tablename, indexname;

-- Verify RLS is enabled
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('questions','student_answers');

-- Verify RLS policies
select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in ('questions','student_answers')
order by tablename, policyname;

-- Verify seed data
select 'components' as tbl, count(*) as rows from components
union all
select 'units',  count(*) from units
union all
select 'topics', count(*) from topics
union all
select 'questions', count(*) from questions;
