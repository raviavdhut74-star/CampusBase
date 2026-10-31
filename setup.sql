-- CampusBase — Supabase SQL Editor madhe PURNA run kara. Punha punha run kela tari chalte.
-- (Aadhicha setup.sql ani setup_v2.sql ya donhi aichya jagi hich ek file vapara.)

-- ============ 1) Admins (max 2) ============
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.limit_admins() returns trigger
language plpgsql as $$
begin
  new.email := lower(new.email);
  if exists (select 1 from public.admins where email = new.email) then
    return null;                                   -- already ahe
  end if;
  if (select count(*) from public.admins) >= 2 then
    raise exception 'Maximum 2 admins allowed';
  end if;
  return new;
end $$;

drop trigger if exists admins_limit on public.admins;
create trigger admins_limit before insert on public.admins
for each row execute function public.limit_admins();

-- (Garaj asel tar admin manually:  insert into public.admins (email) values ('tumcha-email@gmail.com');)

drop policy if exists "admin reads self" on public.admins;
create policy "admin reads self" on public.admins for select to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Email confirm zala + admins list madhe asel tarach true
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public, auth as $$
  select exists (
    select 1 from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;

-- ============ 2) Student profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  prn text unique,
  name text not null default '',
  email text,
  university text, branch text, year text,
  photo text check (photo is null or length(photo) < 80000),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, university, branch, year, photo) on public.profiles to authenticated;   -- PRN / email badalta yet nahi

-- ============ 3) Admin register code ============
-- Code random banto (kunalahi mahit nahi). Pahanyasathi SQL Editor madhe:  select code from public.admin_secret;
-- Swatahcha thevaycha asel:  update public.admin_secret set code = 'tumcha-secret';
create table if not exists public.admin_secret (code text not null);
alter table public.admin_secret enable row level security;
insert into public.admin_secret (code)
select replace(gen_random_uuid()::text, '-', '') where not exists (select 1 from public.admin_secret);

-- ============ 4) Navin user -> profile (admin code asel tar admin) ============
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb); c text := m->>'admin_code';
begin
  if c is not null and c <> '' then
    if c is distinct from (select code from public.admin_secret limit 1) then
      raise exception 'Invalid admin code';
    end if;
    if not exists (select 1 from public.admins where lower(email) = lower(new.email)) then
      insert into public.admins (email) values (lower(new.email));   -- 2-admin limit trigger
    end if;
    insert into public.profiles (id, name, email)
    values (new.id, coalesce(nullif(m->>'name', ''), 'Admin'), lower(new.email))
    on conflict (id) do nothing;
  else
    insert into public.profiles (id, prn, name, email, university, branch, year)
    values (new.id, nullif(upper(m->>'prn'), ''),
            coalesce(nullif(m->>'name', ''), nullif(m->>'full_name', ''), split_part(new.email, '@', 1)),
            lower(new.email), m->>'university', m->>'branch', m->>'year')
    on conflict (id) do nothing;
  end if;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Aadhi register zalelya users sathi profile
insert into public.profiles (id, name, email)
select id, split_part(email, '@', 1), lower(email) from auth.users
on conflict (id) do nothing;

-- ============ 5) Login by PRN + SID search ============
drop function if exists public.login_email(text);     -- junya version madhe parameter che nav vegle hote
create function public.login_email(p text) returns text
language sql security definer stable set search_path = public as $$
  select email from public.profiles where prn = upper(trim(p)) limit 1
$$;
revoke all on function public.login_email(text) from public;
grant execute on function public.login_email(text) to anon, authenticated;

drop function if exists public.find_student(text);
create function public.find_student(p_sid text)
returns table (name text, branch text, year text, university text)
language sql security definer stable set search_path = public as $$
  select pr.name, pr.branch, pr.year, pr.university
  from public.profiles pr
  where auth.uid() is not null and pr.prn is not null
    and '@' || regexp_replace(lower(trim(pr.name)), '\s+', '.', 'g')
        = '@' || regexp_replace(regexp_replace(lower(trim(p_sid)), '^@', ''), '\s+', '.', 'g')
  limit 5
$$;
revoke all on function public.find_student(text) from public, anon;
grant execute on function public.find_student(text) to authenticated;

-- ============ 6) Study material ============
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  university text not null,
  branch text not null,
  year text not null,
  type text not null,
  title text not null check (char_length(title) <= 120),
  file_path text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);
alter table public.resources enable row level security;
drop policy if exists "anyone reads resources" on public.resources;
create policy "anyone reads resources" on public.resources for select using (true);
drop policy if exists "admins insert resources" on public.resources;
create policy "admins insert resources" on public.resources for insert to authenticated with check (public.is_admin());
drop policy if exists "admins delete resources" on public.resources;
create policy "admins delete resources" on public.resources for delete to authenticated using (public.is_admin());

-- ============ 7) File storage (public read, admin write, any file type, 20 MB) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pdfs', 'pdfs', true, 20971520, null)
on conflict (id) do update set public = true, file_size_limit = 20971520, allowed_mime_types = null;

drop policy if exists "admins upload pdfs" on storage.objects;
create policy "admins upload pdfs" on storage.objects for insert to authenticated
with check (bucket_id = 'pdfs' and public.is_admin());
drop policy if exists "admins delete pdfs" on storage.objects;
create policy "admins delete pdfs" on storage.objects for delete to authenticated
using (bucket_id = 'pdfs' and public.is_admin());
