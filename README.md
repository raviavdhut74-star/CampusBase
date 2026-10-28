# CampusBase

University syllabus, notes, question papers आणि important questions एकाच ठिकाणी.
Frontend: HTML/CSS/JS · Backend: Supabase (Database + Storage + Email login).

## फाइल्स
| फाइल | काम |
|---|---|
| `index.html`, `script.js`, `style.css` | मुख्य साइट |
| `auth.html`, `auth.js` | Student Login / Register / Forgot password |
| `admin-login.html`, `admin-login.js` | Admin login |
| `admin.html`, `admin.js` | PDF upload / delete (फक्त 2 admins) |
| `catalog.js` | Universities, Branches, Years, Types ची एकच यादी |
| `supabase.js` | Supabase URL + anon key |
| `nav-auth.js` | होमपेजवर Login / Logout लिंक |
| `setup.sql` | Tables, security आणि 2-admin मर्यादा |

## सेटअप (एकदाच)
1. `setup.sql` मध्ये `admin1@gmail.com` आणि `admin2@gmail.com` च्या जागी **दोन खरे admin email** टाका.
   आधी जुनी SQL चालवली असेल तर सर्वात आधी `drop table if exists public.resources;` चालवा.
2. SQL Editor मध्ये पूर्ण `setup.sql` Run करा.
3. **Authentication → Providers → Email** चालू ठेवा.
4. **Authentication → URL Configuration:**
   - Site URL: `https://raviavdhut74-star.github.io/CampusBase/`
   - Redirect URLs: `.../CampusBase/index.html` आणि `.../CampusBase/auth.html`
5. दोन्ही admins ने आधी `auth.html` वर **Register** करायचे (SQL मधलाच email), email confirm करायचा.
6. मग `admin-login.html` वरून login करून PDF upload करा.

## टीप
- Supabase चा free email फार कमी मेल पाठवतो (तासाला काही). जास्त वापरकर्ते असतील तर Project Settings → Auth → SMTP मध्ये स्वतःचा SMTP जोडा.
- Admin होण्यासाठी email confirm असणे आणि `admins` यादीत असणे दोन्ही लागते.
- University/Branch बदलायचे असल्यास फक्त `catalog.js` बदला.
