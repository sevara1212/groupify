-- ============================================================
-- Groupify – full schema
-- ============================================================

-- 0. Enable UUID generation
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. projects
-- ──────────────────────────────────────────────────────────────
create table if not exists projects (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  course_name          text,
  assignment_title     text,
  due_date             text,                       -- ISO date string
  group_size           integer default 4,
  ai_enabled           boolean default true,
  join_code            text unique,
  assignment_brief_text text,
  rubric_raw_text      text,
  created_at           timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. members
-- ──────────────────────────────────────────────────────────────
create table if not exists members (
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
create table if not exists rubric_criteria (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references projects(id) on delete cascade,
  name             text not null,
  weight_percent   integer default 0,
  description      text,
  required_skills  jsonb default '[]'::jsonb,      -- array of skill tag strings
  task_stage       text default 'mid',             -- early | mid | late
  suggested_tasks  jsonb default '[]'::jsonb,      -- array of task description strings
  coverage_status  text default 'uncovered',       -- uncovered | in_progress | covered
  created_at       timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 4. quiz_questions
-- ──────────────────────────────────────────────────────────────
create table if not exists quiz_questions (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references projects(id) on delete cascade,
  question_number   integer,
  question_text     text not null,
  question_type     text not null,                  -- multi_select_roles | confidence_sliders | availability_grid | preference_ranking | text_input
  skill_dimension   text,
  options           jsonb,                          -- array of {label, skill_tag} or null
  created_at        timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 5. quiz_answers
-- ──────────────────────────────────────────────────────────────
create table if not exists quiz_answers (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  question_id  uuid not null references quiz_questions(id) on delete cascade,
  answer       jsonb,                              -- flexible: object, array, or string
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 6. tasks
-- ──────────────────────────────────────────────────────────────
create table if not exists tasks (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references projects(id) on delete cascade,
  member_id            uuid references members(id) on delete set null,
  rubric_criterion_id  uuid references rubric_criteria(id) on delete set null,
  title                text not null,
  status               text default 'todo',        -- todo | in_progress | done
  due_date             text,                        -- ISO date string
  progress_percent     integer default 0,
  created_at           timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 7. risk_alerts
-- ──────────────────────────────────────────────────────────────
create table if not exists risk_alerts (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  type         text not null,                      -- overdue | at_risk | imbalance
  message      text not null,
  member_id    uuid references members(id) on delete set null,
  task_id      uuid references tasks(id) on delete set null,
  dismissed    boolean default false,
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- Indexes for common query patterns
-- ──────────────────────────────────────────────────────────────
create index if not exists idx_members_project      on members(project_id);
create index if not exists idx_rubric_project       on rubric_criteria(project_id);
create index if not exists idx_questions_project    on quiz_questions(project_id);
create index if not exists idx_answers_member       on quiz_answers(member_id);
create index if not exists idx_answers_project      on quiz_answers(project_id);
create index if not exists idx_tasks_project        on tasks(project_id);
create index if not exists idx_tasks_member         on tasks(member_id);
create index if not exists idx_alerts_project       on risk_alerts(project_id);
create index if not exists idx_alerts_undismissed   on risk_alerts(project_id, dismissed) where dismissed = false;
create index if not exists idx_projects_join_code   on projects(join_code);

-- ──────────────────────────────────────────────────────────────
-- Row-Level Security (allow all via anon key for now)
-- ──────────────────────────────────────────────────────────────
alter table projects        enable row level security;
alter table members         enable row level security;
alter table rubric_criteria enable row level security;
alter table quiz_questions  enable row level security;
alter table quiz_answers    enable row level security;
alter table tasks           enable row level security;
alter table risk_alerts     enable row level security;

-- Permissive policies – open access for anon key (tighten later)
create policy "Allow all on projects"        on projects        for all using (true) with check (true);
create policy "Allow all on members"         on members         for all using (true) with check (true);
create policy "Allow all on rubric_criteria" on rubric_criteria for all using (true) with check (true);
create policy "Allow all on quiz_questions"  on quiz_questions  for all using (true) with check (true);
create policy "Allow all on quiz_answers"    on quiz_answers    for all using (true) with check (true);
create policy "Allow all on tasks"           on tasks           for all using (true) with check (true);
create policy "Allow all on risk_alerts"     on risk_alerts     for all using (true) with check (true);
