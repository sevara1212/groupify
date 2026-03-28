-- ============================================================
-- Groupify – full schema  (drop + recreate)
-- ============================================================

-- 0. Drop everything in reverse dependency order
drop table if exists messages      cascade;
drop table if exists risk_alerts   cascade;
drop table if exists quiz_answers  cascade;
drop table if exists tasks         cascade;
drop table if exists quiz_questions cascade;
drop table if exists rubric_criteria cascade;
drop table if exists members       cascade;
drop table if exists projects      cascade;

-- 0b. Enable UUID generation
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. projects
-- ──────────────────────────────────────────────────────────────
create table projects (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  course_name           text,
  assignment_title      text,
  due_date              text,
  group_size            integer default 4,
  ai_enabled            boolean default true,
  join_code             text unique,
  assignment_brief_text text,
  rubric_raw_text       text,
  created_at            timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. members
-- ──────────────────────────────────────────────────────────────
create table members (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  name         text not null,
  role         text,
  quiz_done    boolean default false,
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 3. rubric_criteria
-- ──────────────────────────────────────────────────────────────
create table rubric_criteria (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references projects(id) on delete cascade,
  name             text not null,
  weight_percent   integer default 0,
  description      text,
  required_skills  jsonb default '[]'::jsonb,
  task_stage       text default 'mid',
  suggested_tasks  jsonb default '[]'::jsonb,
  coverage_status  text default 'uncovered',
  created_at       timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 4. quiz_questions
-- ──────────────────────────────────────────────────────────────
create table quiz_questions (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references projects(id) on delete cascade,
  question_number   integer,
  question_text     text not null,
  question_type     text not null,
  skill_dimension   text,
  options           jsonb,
  created_at        timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 5. quiz_answers
-- ──────────────────────────────────────────────────────────────
create table quiz_answers (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  question_id  uuid not null references quiz_questions(id) on delete cascade,
  answer       jsonb,
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 6. tasks
-- ──────────────────────────────────────────────────────────────
create table tasks (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references projects(id) on delete cascade,
  member_id            uuid references members(id) on delete set null,
  rubric_criterion_id  uuid references rubric_criteria(id) on delete set null,
  title                text not null,
  status               text default 'todo',
  due_date             text,
  progress_percent     integer default 0,
  created_at           timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 7. risk_alerts
-- ──────────────────────────────────────────────────────────────
create table risk_alerts (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  type         text not null,
  message      text not null,
  member_id    uuid references members(id) on delete set null,
  task_id      uuid references tasks(id) on delete set null,
  dismissed    boolean default false,
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 8. messages (group chat)
-- ──────────────────────────────────────────────────────────────
create table messages (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  member_id    uuid references members(id) on delete set null,
  author_name  text not null,
  text         text not null,
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────
create index idx_members_project      on members(project_id);
create index idx_rubric_project       on rubric_criteria(project_id);
create index idx_questions_project    on quiz_questions(project_id);
create index idx_answers_member       on quiz_answers(member_id);
create index idx_answers_project      on quiz_answers(project_id);
create index idx_tasks_project        on tasks(project_id);
create index idx_tasks_member         on tasks(member_id);
create index idx_alerts_project       on risk_alerts(project_id);
create index idx_alerts_undismissed   on risk_alerts(project_id, dismissed) where dismissed = false;
create index idx_projects_join_code   on projects(join_code);
create index idx_messages_project     on messages(project_id);
create index idx_messages_created     on messages(project_id, created_at);

-- ──────────────────────────────────────────────────────────────
-- Enable Realtime for messages table
-- ──────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table messages;
  end if;
exception when others then
  null;
end $$;

-- ──────────────────────────────────────────────────────────────
-- Row-Level Security (permissive for anon key)
-- ──────────────────────────────────────────────────────────────
alter table projects        enable row level security;
alter table members         enable row level security;
alter table rubric_criteria enable row level security;
alter table quiz_questions  enable row level security;
alter table quiz_answers    enable row level security;
alter table tasks           enable row level security;
alter table risk_alerts     enable row level security;
alter table messages        enable row level security;

create policy "Allow all on projects"        on projects        for all using (true) with check (true);
create policy "Allow all on members"         on members         for all using (true) with check (true);
create policy "Allow all on rubric_criteria" on rubric_criteria for all using (true) with check (true);
create policy "Allow all on quiz_questions"  on quiz_questions  for all using (true) with check (true);
create policy "Allow all on quiz_answers"    on quiz_answers    for all using (true) with check (true);
create policy "Allow all on tasks"           on tasks           for all using (true) with check (true);
create policy "Allow all on risk_alerts"     on risk_alerts     for all using (true) with check (true);
create policy "Allow all on messages"        on messages        for all using (true) with check (true);
