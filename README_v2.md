# CampusBase v2 add-on (purane files badlele nahit)

Navin files: `portal.html`, `portal.js`, `portal.css`, `setup_v2.sql`, `README_v2.md`
Baki sagle files (index.html, auth*, admin*, supabase.js, setup.sql, style.css...) jase hote tase ahet.

## Setup
1. Pahile `setup.sql` run kara (jar adhi kela nasel), mag `setup_v2.sql` run kara.
2. `setup_v2.sql` madhe `CHANGE-THIS-ADMIN-CODE` badla (kiva run kelyavar `update public.admin_secret set code='...'`).
3. `supabase.js` madhe URL + anon key (adhich bharli asel tar kahi nahi).
4. Authentication -> Email provider ON. Redirect URL madhe `portal.html` cha URL jodaa.
5. `portal.html` ughda.

## Vapar
- Student: Register (PRN, name, email, university, branch, year, password). Login: PRN kiva email + password.
- Admin: Login page -> "Master Login" -> "Admin register" (admin code lagto). Max 2 admin. Admin login nantar "Upload Files": kontyahi file type upload/delete. Students la ha option disat nahi, ani database (RLS) pan block karto.
- Jar `setup.sql` madhe 2 admin emails adhich ahet, tar tyanna code nako — to email var normal Register kara, to admin hoil. Navin admin code ne banvayche asel tar adhi `delete from public.admins;` kara.
- Social links (Instagram/WhatsApp/Telegram) OFF. `portal.js` chya var `SOCIAL` madhe `on:true` + `url`.
- Premium: add kele nahi.
