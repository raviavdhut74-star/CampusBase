-- Supabase Dashboard > SQL Editor madhe he purna run kara (ekdach)

create table if not exists public.resources (
  id bigint generated always as identity primary key,
  uni text not null,
  branch text not null,
  year text not null,
  type text not null check (type in ('syllabus','notes','papers','imp')),
  title text not null check (char_length(title) <= 120),
  url text not null,
  path text,
  created_at timestamptz not null default now()
);

-- Admin email list (RLS chalu, policy nahi => API var koni vachu shakat nahi)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

-- ⚠️ Apla Google email ithe taka:
insert into public.admins (email) values ('your-email@gmail.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

alter table public.resources enable row level security;
create policy "anyone can read"  on public.resources for select using (true);
create policy "admin can insert" on public.resources for insert to authenticated with check (public.is_admin());
create policy "admin can delete" on public.resources for delete to authenticated using (public.is_admin());

-- PDF storage bucket (public, 20 MB, fakt PDF)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pdfs', 'pdfs', true, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create policy "admin can upload pdf" on storage.objects for insert to authenticated
  with check (bucket_id = 'pdfs' and public.is_admin());
create policy "admin can delete pdf" on storage.objects for delete to authenticated
  using (bucket_id = 'pdfs' and public.is_admin());
