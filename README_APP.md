# CampusBase — App + Premium guide

## 1) Files open honyasathi (ek vela)
Supabase → SQL Editor madhe `open_files.sql` run kara. Ata logged-in students la sagle files ughadtat.

## 2) Premium (ata BAND ahe)
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
