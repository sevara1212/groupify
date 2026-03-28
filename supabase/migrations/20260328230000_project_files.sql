-- Shared project links / document references (paste Google Docs, Drive, etc.)
create table if not exists project_files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  folder       text not null default 'Shared',
  title        text not null,
  url          text not null,
  author_name  text,
  created_at   timestamptz default now()
);

create index if not exists idx_project_files_project on project_files(project_id);

alter table project_files enable row level security;

drop policy if exists "Allow all on project_files" on project_files;
create policy "Allow all on project_files" on project_files for all using (true) with check (true);
