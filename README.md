# CampusBase

इंजिनिअरिंग विद्यार्थ्यांसाठी mobile-app सारखी वेबसाइट: Notes, Question Bank, Previous Year Papers, Books आणि बरेच काही.
Frontend: HTML + CSS + JavaScript · Backend: Supabase (login, database, file storage).

## फोल्डर रचना
```
CampusBase/
├── index.html              ← पूर्ण पेज (सर्व स्क्रीन यातच)
├── README.md
├── assets/
│   ├── css/style.css       ← सर्व डिझाइन (थीम रंग वरच्या :root मध्ये)
│   └── js/
│       ├── app.js          ← सर्व लॉजिक (login, profile, upload…)
│       ├── catalog.js      ← Universities, Branches, Years, Types + Social links
│       └── supabase.js     ← Supabase URL + anon key
└── database/
    └── setup.sql           ← Supabase मध्ये एकदा चालवायची SQL
```

## GitHub वरून काढून टाकायच्या जुन्या फाइल्स
सर्व जुन्या फाइल्स डिलीट करा आणि फक्त वरची रचना ठेवा. खास करून या:
`auth.html`, `auth.js`, `admin.html`, `admin.js`, `admin-login.html`, `admin-login.js`, `nav-auth.js`, `script.js`,
`catalog.js` (बाहेरची), `supabase.js` (बाहेरची), `style.css` (बाहेरची), `portal.html`, `portal.js`, `portal.css`,
`setup.sql` (बाहेरची), `setup_v2.sql`, `README_v2.md` आणि `…_1.js`, `…_1.html` अशी सर्व डुप्लिकेट नावाची फाइल.

## सेटअप
1. `database/setup.sql` ची सामग्री Supabase → SQL Editor मध्ये पूर्ण चालवा (पुन्हा चालवली तरी चालते).
2. Supabase → Authentication → URL Configuration: Site URL आणि Redirect URL = `https://raviavdhut74-star.github.io/CampusBase/`
3. वरची रचना GitHub वर upload करा.

## वापर
- **Login:** PRN **किंवा** email + password.
- **Register:** PRN, नाव, email, university, branch, year, password.
- **Admin:** Login पेजवर "Master Login". Admin ला मेनूमध्ये "Upload Files" दिसते (कोणतीही फाइल, 20 MB पर्यंत). Admin फक्त 2.
  नवीन admin साठी "Admin register" + admin code. Code पाहण्यासाठी SQL Editor मध्ये `select code from public.admin_secret;`
- **Universities / Branches / Types बदलणे:** फक्त `assets/js/catalog.js`.
- **Instagram / WhatsApp / Telegram चालू करणे:** `assets/js/catalog.js` मध्ये `on: true` आणि `url` टाका.
