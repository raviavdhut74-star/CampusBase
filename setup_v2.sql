-- CampusBase v2 add-on. Run AFTER setup.sql (setup.sql is NOT changed). Safe to re-run.

-- 1) Student profiles (PRN, name, university, branch, year, photo)
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
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (name, university, branch, year, photo) on public.profiles to authenticated;  -- PRN can't be changed

-- 2) Admin registration code (change it!). Not readable from the app (RLS on, no policy).
create table if not exists public.admin_secret (code text not null);
alter table public.admin_secret enable row level security;
insert into public.admin_secret (code) select 'CHANGE-THIS-ADMIN-CODE' where not exists (select 1 from public.admin_secret);
-- To change later:  update public.admin_secret set code = 'my-new-secret';

-- 3) On every signup: create profile; if an admin code was given, validate it and add to admins (max 2, enforced by setup.sql trigger)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb); c text := m->>'admin_code';
begin
  if c is not null and c <> '' then
    if c is distinct from (select code from public.admin_secret limit 1) then raise exception 'Invalid admin code'; end if;
    if not exists (select 1 from public.admins where lower(email) = lower(new.email)) then
      insert into public.admins (email) values (lower(new.email));
    end if;
    insert into public.profiles (id, name, email) values (new.id, coalesce(nullif(m->>'name',''), 'Admin'), new.email);
  else
    insert into public.profiles (id, prn, name, email, university, branch, year)
    values (new.id, nullif(upper(m->>'prn'), ''), coalesce(nullif(m->>'name',''), nullif(m->>'full_name',''), split_part(new.email,'@',1)), new.email, m->>'university', m->>'branch', m->>'year');
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Profiles for accounts created before this script (e.g. via auth.html)
insert into public.profiles (id, name, email) select id, split_part(email,'@',1), email from auth.users on conflict (id) do nothing;

-- 4) Login by PRN: finds the email for a PRN, and SID search
create or replace function public.login_email(p text) returns text
language sql security definer stable set search_path = public as $$ select email from public.profiles where prn = upper(p) limit 1 $$;
revoke all on function public.login_email(text) from public;
grant execute on function public.login_email(text) to anon, authenticated;

create or replace function public.find_student(p_sid text) returns table (name text, branch text, year text, university text)
language sql security definer stable set search_path = public as $$
  select pr.name, pr.branch, pr.year, pr.university from public.profiles pr
  where pr.prn is not null and '@' || lower(regexp_replace(trim(pr.name), '\s+', '.', 'g')) = lower(p_sid) limit 1 $$;
revoke all on function public.find_student(text) from public;
grant execute on function public.find_student(text) to authenticated;

-- 5) Admins can upload ANY file type (setup.sql allowed only PDF)
update storage.buckets set allowed_mime_types = null where id = 'pdfs';
