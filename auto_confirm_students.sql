-- CampusBase: student la email confirm shivay login. Supabase -> SQL Editor madhe ek vela run kara (safe to re-run).

-- 1) Aadhi register zalele sagle students (e.g. shubhyaaa@gmail.com) confirm kara
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;

-- 2) Pudhche navin students automatic confirm hotil
create or replace function public.auto_confirm_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end $$;
drop trigger if exists auto_confirm_email on auth.users;
create trigger auto_confirm_email before insert on auth.users for each row execute function public.auto_confirm_email();
