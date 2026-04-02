-- WJEC GCSE Physics MCQ Question Bank
-- Migration: initial schema

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- COMPONENTS
-- ============================================================
create table components (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- UNITS
-- ============================================================
create table units (
  id            uuid primary key default gen_random_uuid(),
  component_id  uuid not null references components(id) on delete cascade,
  name          text not null,
  code          text not null,
  created_at    timestamptz not null default now()
);

create index idx_units_component_id on units(component_id);

-- ============================================================
-- TOPICS
-- ============================================================
create table topics (
  id          uuid primary key default gen_random_uuid(),
  unit_id     uuid not null references units(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index idx_topics_unit_id on topics(unit_id);

-- ============================================================
-- QUESTIONS
-- ============================================================
create table questions (
  id              uuid primary key default gen_random_uuid(),
  topic_id        uuid not null references topics(id) on delete cascade,
  stem            text not null,
  option_a        text not null,
  option_b        text not null,
  option_c        text not null,
  option_d        text not null,
  correct_answer  char(1) not null check (correct_answer in ('A','B','C','D')),
  bloom_level     int not null check (bloom_level between 1 and 6),
  bloom_label     text not null,
  difficulty      text not null check (difficulty in ('foundation','higher')),
  marks           int not null default 1,
  explanation     text,
  created_at      timestamptz not null default now()
);

create index idx_questions_topic_id   on questions(topic_id);
create index idx_questions_bloom_level on questions(bloom_level);
create index idx_questions_difficulty  on questions(difficulty);

-- ============================================================
-- STUDENT ANSWERS
-- ============================================================
create table student_answers (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null,
  question_id      uuid not null references questions(id) on delete cascade,
  selected_answer  char(1) not null check (selected_answer in ('A','B','C','D')),
  is_correct       bool not null,
  answered_at      timestamptz not null default now()
);

create index idx_student_answers_student_id   on student_answers(student_id);
create index idx_student_answers_question_id  on student_answers(question_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- questions: readable by any authenticated user
alter table questions enable row level security;

create policy "questions_select_authenticated"
  on questions
  for select
  to authenticated
  using (true);

-- student_answers: each student can only read/write their own rows
alter table student_answers enable row level security;

create policy "student_answers_select_own"
  on student_answers
  for select
  to authenticated
  using (student_id = auth.uid());

create policy "student_answers_insert_own"
  on student_answers
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "student_answers_update_own"
  on student_answers
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "student_answers_delete_own"
  on student_answers
  for delete
  to authenticated
  using (student_id = auth.uid());

-- ============================================================
-- SEED: WJEC GCSE Physics components and units
-- ============================================================

insert into components (id, name, code) values
  ('a1000000-0000-0000-0000-000000000001', 'Component 1: Waves, Electricity and Light',  'C1'),
  ('a1000000-0000-0000-0000-000000000002', 'Component 2: Forces, Space and Magnetism',   'C2');

insert into units (id, component_id, name, code) values
  -- Component 1
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Waves',        'C1U1'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Electricity',  'C1U2'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Light',        'C1U3'),
  -- Component 2
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Forces',       'C2U1'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Space',        'C2U2'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Magnetism',    'C2U3');
