# CampusBase — Subscription (Cashfree) + fixes

## Files
- `subscription_setup.sql`  -> Supabase SQL Editor me run karo (supabase_setup_all.sql ke BAAD)
- `supabase/functions/*`    -> Cashfree payment (Edge Functions: create-order, verify-payment, cashfree-webhook)
- `portal.js`, `index.html` -> purane files ki jagah replace karo

## Setup (order me)
1. `subscription_setup.sql` run karo. Prices `plans` table me hain (monthly Rs99, yearly Rs499) — badal lo.
   (Agar pehle wali Razorpay version run kar chuke ho to bhi chalegi, table convert ho jayegi.)
2. Cashfree dashboard (merchant.cashfree.com) -> Payment Gateway -> Developers -> API Keys.
   PEHLE SANDBOX (test) keys lo. App ID + Secret Key note karo.
3. Supabase CLI (laptop pe ek baar):
   supabase login
   supabase link --project-ref tmwordddcqxllkcepdcz
   supabase secrets set CASHFREE_APP_ID=xxxx CASHFREE_SECRET_KEY=xxxx CASHFREE_ENV=sandbox SITE_URL=https://TUMHARI-SITE-URL/
   supabase functions deploy create-order
   supabase functions deploy verify-payment
   supabase functions deploy cashfree-webhook --no-verify-jwt
   (SITE_URL = jahan site live hai, end me / ke saath, jaise https://username.github.io/campusbase/)
4. Webhook URL har order ke saath automatically jata hai. Agar test payment ke baad plan auto-activate na ho to
   Cashfree -> Developers -> Webhooks me ye URL add karo:
   https://tmwordddcqxllkcepdcz.supabase.co/functions/v1/cashfree-webhook
5. `portal.js` + `index.html` upload karo. Hard refresh.
6. Test: naya student account -> koi locked file -> Premium -> mobile number -> sandbox test payment -> file khulni chahiye.

## LIVE jaane ke liye
- Cashfree KYC/activation complete karo, production keys lo.
- Dashboard me apni website ka domain whitelist karo.
- `supabase secrets set CASHFREE_APP_ID=<prod> CASHFREE_SECRET_KEY=<prod> CASHFREE_ENV=production`
- Privacy Policy, Refund Policy, Terms, Contact pages live hone chahiye (footer me abhi "Coming soon").

## Kaise kaam karta hai
- Bucket PRIVATE hai. File sirf premium student / admin / "Free" mark ki hui file ke liye 5-min signed link se khulti hai.
  (Purane public file links band ho jayenge — yehi gating hai.)
- Student ko payment ke liye mobile number dena padta hai (Cashfree ko chahiye).
- Payment confirm SERVER pe hota hai: Cashfree se seedha order status poocha jata hai aur amount apne DB se match hota hai.
  Browser ya webhook body pe bharosa nahi kiya jata.
- Student tab band kar de to webhook plan activate kar deta hai. Dobara kharidne par plan extend hota hai.
- Admin panel: upload me "Free for everyone" tick, aur "Grant Premium" se UPI/cash wale student ko manually premium.

## ZAROORI
- Admin passwords badlo (Supabase -> Authentication -> Users). SQL/README files public site pe upload mat karo.
- `portal.html` delete kar do (purana copy, login pe crash karta hai). Live page = `index.html`.
