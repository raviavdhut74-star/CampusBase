# CampusBase — App + Premium guide

## 1) Files open honyasathi (ek vela)
Supabase → SQL Editor madhe `open_files.sql` run kara. Ata logged-in students la sagle files ughadtat.

## 2) Premium (ata CHALU ahe: Silver ₹99 / Gold ₹149 / Diamond ₹249, 30 divas)
`portal.js` chya var `const PREMIUM_ON=false;` ahe.
- **false:** konatyahi student la Premium/🔒/paywall disat nahi, sagle files open.
- **Premium chalu karayla** (jevha tu sangshil): `PREMIUM_ON=true` kara → `subscription_setup.sql` run kara →
  `open_files.sql` chya khali dilelya "PREMIUM chalu karayla" steps (3 SQL lines) run kara.
  Premium cha sagla code (plans, payment, grant premium) already ahe, fakt switch ON karaycha.

## 3) Web → App
Site Vercel var HTTPS ahe, mhanun ti **installable app (PWA)** zali ahe. Navin files: `manifest.json`, `sw.js`, `icons/`.

**A) Fakt install (zero cost):** phone var Chrome madhe site ugdha → ⋮ → **Install app / Add to Home screen**.
(App madhe "📱 Download App" menu madhe pan "Install App" button yeto.)

**B) APK / Play Store (Android Studio shivay):**
1. Site deploy kara (ya files sakat) ani URL tapasa: `https://<tuzi-site>.vercel.app/manifest.json` ughadto ka.
2. https://www.pwabuilder.com → site cha URL taka → Start → **Package for stores → Android**.
3. Package name: `in.campusbase.app` (kiva tuza). Download kelelya zip madhe `.apk` / `.aab` + signing key ahe — **signing key jpun thev**, nahitar update deta yet nahi.
4. PWABuilder `assetlinks.json` deto — to `/.well-known/assetlinks.json` ya path var tuzya site madhe takla ki app madhe browser bar disnar nahi (full screen).
5. Direct download sathi `.apk` GitHub Releases kiva Vercel madhe thev, tyacha link `portal.js` madhil `const APK_URL=""` madhe paste kara.
6. Play Store sathi `.aab` upload kara (Google developer account $25 ek vela).

**C) Capacitor (native plugins/notifications hava asel tar):** `npm i @capacitor/core @capacitor/cli @capacitor/android` →
`npx cap init CampusBase in.campusbase.app --web-dir .` → `npx cap add android` → `npx cap open android` → Android Studio madhun Build APK.
(Ya madhe file open karnyasathi PDF viewer plugin lagu shakto, tyamule B (PWABuilder) sopa ahe.)

## 4) Microsoft Store (Windows)
Microsoft Store var individual developer registration ata free ahe (personal Microsoft account + ID verification).
1. https://partner.microsoft.com → Developer account banva → **Apps and games → New product → MSIX or PWA app** → app cha naav reserve kara.
2. **Product management → Product identity** madhun 3 values copy kara: *Package ID, Publisher ID, Publisher display name*.
3. https://www.pwabuilder.com → site cha URL → Package for stores → **Windows** → vartil 3 values paste kara → Generate → `.msixbundle` download.
4. Partner Center madhe **Start your submission → Packages** madhe `.msixbundle` upload kara. Store listing: description, screenshots (1366x768 kiva 1920x1080, kimaan 1), age rating.
5. **Privacy policy URL:** `https://<tuzi-site>/privacy.html` (file ya zip madhe ahe — tyat tuza email taka ani deploy kara).
6. Submit. Review sadharan 1–2 divas gheto.
Navin version: site deploy kara — app web content automatic update hoto (store package parat upload karaycha garaj nahi, manifest badallyas tarach).

## 5) Subjects bhar bharlyasathi
Admin → Upload Files → University/Branch/Year/Semester nivadha → Subject chya baajula **＋ New** → ek line = ek subject paste kara → Add.

## 6) Premium chalu karnyache steps
1. `premium_tiers.sql` run kara (plans, tiers, private bucket, policies).
2. Payment sathi Cashfree: `README_subscription.md` pramane 3 Edge Functions (create-order, verify-payment, cashfree-webhook) deploy kara ani Cashfree keys secrets madhe taka — he kelyashivay "Pay" button chalnar nahi.
3. Admin upload page madhe ata **Access** dropdown ahe: Free / Silver / Gold / Diamond. Silver chi file Silver, Gold ani Diamond student la; Gold chi file Gold ani Diamond la; Diamond chi file fakt Diamond la ughadte.
4. Premium parat band karayla: `portal.js` madhe `PREMIUM_ON=false`.
