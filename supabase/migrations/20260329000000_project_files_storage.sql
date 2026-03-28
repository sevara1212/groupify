-- Extends project_files for uploads + Storage bucket (run if you see "table not found")
-- Safe to re-run: IF NOT EXISTS / IF NOT EXISTS columns / idempotent bucket

create table if not exists public.project_files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  folder       text not null default 'Shared',
  title        text not null,
  url          text not null,
  author_name  text,
  created_at   timestamptz default now(),
  storage_path text,
  file_name    text,
  mime_type    text
);

alter table public.project_files add column if not exists storage_path text;
alter table public.project_files add column if not exists file_name text;
alter table public.project_files add column if not exists mime_type text;

create index if not exists idx_project_files_project on public.project_files(project_id);

alter table public.project_files enable row level security;

drop policy if exists "Allow all on project_files" on public.project_files;
create policy "Allow all on project_files" on public.project_files for all using (true) with check (true);

-- Public bucket for team file sharing (anon key in app)
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "project_files_select" on storage.objects;
drop policy if exists "project_files_insert" on storage.objects;
drop policy if exists "project_files_update" on storage.objects;
drop policy if exists "project_files_delete" on storage.objects;

create policy "project_files_select" on storage.objects for select
  using (bucket_id = 'project-files');

create policy "project_files_insert" on storage.objects for insert
  with check (bucket_id = 'project-files');

create policy "project_files_update" on storage.objects for update
  using (bucket_id = 'project-files');

create policy "project_files_delete" on storage.objects for delete
  using (bucket_id = 'project-files');
