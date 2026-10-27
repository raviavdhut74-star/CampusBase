-- Supabase Dashboard > SQL Editor madhe ha sampurna paste karun Run kara.
-- Shevatchya ola madhe 'you@gmail.com' badla.

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  uni text not null,
  branch text not null,
  year text not null,
  type text not null,
  title text not null check (char_length(title) between 1 and 120),
  url text not null,
  path text,
  created_at timestamptz not null default now()
);

create table if not exists admins (email text primary key);

create table if not exists user_saved (
  user_id uuid primary key references auth.users on delete cascade,
  saved jsonb not null default '[]'
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from admins where email = auth.jwt() ->> 'email')
$$;

alter table resources enable row level security;
alter table admins enable row level security;      -- policy nahi = direct access band
alter table user_saved enable row level security;

create policy "anyone reads resources" on resources for select using (true);
create policy "admin inserts resources" on resources for insert to authenticated with check (public.is_admin());
create policy "admin updates resources" on resources for update to authenticated using (public.is_admin());
create policy "admin deletes resources" on resources for delete to authenticated using (public.is_admin());
create policy "user manages own saved" on user_saved for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PDF bucket (public read, 20 MB, fakt PDF)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pdfs', 'pdfs', true, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create policy "admin uploads pdf" on storage.objects for insert to authenticated
  with check (bucket_id = 'pdfs' and public.is_admin());
create policy "admin deletes pdf" on storage.objects for delete to authenticated
  using (bucket_id = 'pdfs' and public.is_admin());

-- Live update sathi
alter publication supabase_realtime add table resources;

insert into admins (email) values ('you@gmail.com') on conflict do nothing;
