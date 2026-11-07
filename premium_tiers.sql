-- CampusBase: Premium Silver/Gold/Diamond (standalone, subscription_setup.sql nantar vegla run karaychi garaj nahi).
-- Supabase -> SQL Editor -> sagla paste -> Run. Safe to re-run.

-- CampusBase — Premium subscription setup.  Run AFTER supabase_setup_all.sql.  Safe to re-run.
-- Supabase -> SQL Editor -> paste -> Run.

-- 1) Plans (price in paise: 9900 = Rs 99). Change prices/days here anytime.
create table if not exists public.plans (
  id text primary key, name text not null,
  price_paise int not null check (price_paise > 0),
  days int not null check (days > 0),
  active boolean not null default true);
alter table public.plans enable row level security;
drop policy if exists "anyone reads plans" on public.plans;
create policy "anyone reads plans" on public.plans for select using (active);

-- 2) Subscriptions (only server code can write; students can only read their own)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text references public.plans(id),
  expires_at timestamptz not null,
  source text not null default 'cashfree',          -- cashfree | admin
  order_id text unique,                              -- one subscription per paid order (idempotent)
  amount_paise int,
  created_at timestamptz not null default now());
-- (if you ran the older Razorpay version of this file, this converts the table)
alter table public.subscriptions drop column if exists razorpay_order_id;
alter table public.subscriptions drop column if exists razorpay_payment_id;
alter table public.subscriptions add column if not exists order_id text unique;
create index if not exists subs_user_idx on public.subscriptions (user_id, expires_at desc);
alter table public.subscriptions enable row level security;
drop policy if exists "read own subs" on public.subscriptions;
create policy "read own subs" on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 3) Pending Cashfree orders (no policies = only service role can touch it)
create table if not exists public.payment_orders (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  amount_paise int not null,
  status text not null default 'created',
  created_at timestamptz not null default now());
alter table public.payment_orders enable row level security;

-- 4) "Does this user have access?"  (admins always do)
create or replace function public.has_active_sub() returns boolean
language sql security definer stable set search_path = public as $$
  select public.is_admin()
      or exists (select 1 from public.subscriptions where user_id = auth.uid() and expires_at > now());
$$;

-- 5) Activate after a verified payment (called ONLY by Edge Functions with the service role). Idempotent per order.
drop function if exists public.activate_subscription(uuid,text,text,text,int);
create or replace function public.activate_subscription(p_user uuid, p_plan text, p_order text, p_amount int)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare d int; base timestamptz; exp timestamptz;
begin
  select expires_at into exp from subscriptions where order_id = p_order;
  if exp is not null then return exp; end if;
  select days into d from plans where id = p_plan;
  if d is null then raise exception 'Unknown plan'; end if;
  select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = p_user;
  exp := base + make_interval(days => d);
  insert into subscriptions (user_id, plan_id, expires_at, source, order_id, amount_paise)
  values (p_user, p_plan, exp, 'cashfree', p_order, p_amount)
  on conflict (order_id) do nothing;
  select expires_at into exp from subscriptions where order_id = p_order;
  return exp;
end $$;
revoke all on function public.activate_subscription(uuid,text,text,int) from public, anon, authenticated;
grant execute on function public.activate_subscription(uuid,text,text,int) to service_role;

-- 6) Admin can give premium manually (e.g. student paid by UPI)
create or replace function public.admin_grant_sub(p_email text, p_days int) returns timestamptz
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid; base timestamptz; exp timestamptz;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_days is null or p_days < 1 or p_days > 3650 then raise exception 'Invalid days'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'No student with this email'; end if;
  select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = uid;
  exp := base + make_interval(days => p_days);
  insert into subscriptions (user_id, plan_id, expires_at, source) values (uid, null, exp, 'admin');
  return exp;
end $$;
revoke all on function public.admin_grant_sub(text,int) from public, anon;
grant execute on function public.admin_grant_sub(text,int) to authenticated;


-- ============ TIERS: Silver Rs 99, Gold Rs 149, Diamond Rs 249 (30 days each) ============
alter table public.plans add column if not exists tier smallint check (tier between 1 and 3);
alter table public.plans add column if not exists description text;
insert into public.plans (id, name, price_paise, days, tier, description) values
  ('silver',  'Silver',   9900, 30, 1, 'Silver-tagged notes, question banks and previous year papers for your university.'),
  ('gold',    'Gold',    14900, 30, 2, 'Everything in Silver plus Gold-only material (answer bank, solved papers, extra notes).'),
  ('diamond', 'Diamond', 24900, 30, 3, 'Everything in Gold plus Diamond-only material (exclusive handwritten notes, important questions and premium resources).')
on conflict (id) do update set name = excluded.name, price_paise = excluded.price_paise, days = excluded.days,
  tier = excluded.tier, description = excluded.description, active = true;
update public.plans set active = false where id in ('monthly','yearly');   -- junya plans band

-- Subscription kontya tier cha ahe
alter table public.subscriptions add column if not exists tier smallint not null default 3;

-- Payment nantar tier sakat activate (Edge Functions hech function vaprat astat — signature same)
create or replace function public.activate_subscription(p_user uuid, p_plan text, p_order text, p_amount int)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare d int; t smallint; base timestamptz; exp timestamptz;
begin
  select expires_at into exp from subscriptions where order_id = p_order;
  if exp is not null then return exp; end if;
  select days, coalesce(tier, 3) into d, t from plans where id = p_plan;
  if d is null then raise exception 'Unknown plan'; end if;
  select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = p_user and tier = t;
  exp := base + make_interval(days => d);
  insert into subscriptions (user_id, plan_id, expires_at, source, order_id, amount_paise, tier)
  values (p_user, p_plan, exp, 'cashfree', p_order, p_amount, t) on conflict (order_id) do nothing;
  select expires_at into exp from subscriptions where order_id = p_order;
  return exp;
end $$;
revoke all on function public.activate_subscription(uuid,text,text,int) from public, anon, authenticated;
grant execute on function public.activate_subscription(uuid,text,text,int) to service_role;

-- Admin manually premium deto (UPI payment): plan + days
drop function if exists public.admin_grant_sub(text,int);
create or replace function public.admin_grant_sub(p_email text, p_days int, p_tier int default 3) returns timestamptz
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid; base timestamptz; exp timestamptz;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_days is null or p_days < 1 or p_days > 3650 then raise exception 'Invalid days'; end if;
  if p_tier is null or p_tier < 1 or p_tier > 3 then raise exception 'Invalid plan'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'No student with this email'; end if;
  select greatest(now(), coalesce(max(expires_at), now())) into base from subscriptions where user_id = uid and tier = p_tier;
  exp := base + make_interval(days => p_days);
  insert into subscriptions (user_id, plan_id, expires_at, source, tier) values (uid, null, exp, 'admin', p_tier);
  return exp;
end $$;
revoke all on function public.admin_grant_sub(text,int,int) from public, anon;
grant execute on function public.admin_grant_sub(text,int,int) to authenticated;

-- Aaplyala kontya tier paryant access ahe (0 free, 1 silver, 2 gold, 3 diamond; admin = 3)
create or replace function public.my_tier() returns int language sql security definer stable set search_path = public as $$
  select case when public.is_admin() then 3
    else coalesce((select max(tier) from public.subscriptions where user_id = auth.uid() and expires_at > now()), 0)::int end $$;
revoke all on function public.my_tier() from public, anon;
grant execute on function public.my_tier() to authenticated;

-- Files: tier (0 = Free, 1 = Silver, 2 = Gold, 3 = Diamond)
alter table public.resources add column if not exists is_free boolean not null default false;
alter table public.resources add column if not exists tier smallint not null default 0 check (tier between 0 and 3);
update public.resources set tier = 1 where tier = 0 and is_free = false;       -- junya "premium only" files = Silver
create or replace function public.resources_sync_free() returns trigger language plpgsql as $$
begin new.is_free := (new.tier = 0); return new; end $$;
drop trigger if exists resources_sync_free on public.resources;
create trigger resources_sync_free before insert or update of tier on public.resources
  for each row execute function public.resources_sync_free();
update public.resources set is_free = (tier = 0);

-- Storage: PRIVATE bucket, file fakt tyala ughadte jyacha plan tier >= file tier
update storage.buckets set public = false where id = 'pdfs';
drop policy if exists "students read all files (premium off)" on storage.objects;
drop policy if exists "read pdfs if allowed" on storage.objects;
create policy "read pdfs if allowed" on storage.objects for select to authenticated
using (bucket_id = 'pdfs' and exists (
  select 1 from public.resources r where r.file_path = storage.objects.name and public.my_tier() >= r.tier));
