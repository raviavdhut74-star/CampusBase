# CampusBase

University syllabus, notes, question papers आणि important questions एकाच ठिकाणी.
Frontend: HTML/CSS/JS · Backend: Supabase (Database + Storage + Google Login).

## फाइल्स
| फाइल | काम |
|---|---|
| `index.html`, `style.css`, `script.js` | विद्यार्थ्यांसाठी मुख्य साइट |
| `admin.html`, `admin.js` | Admin पॅनल (PDF upload / delete) |
| `supabase.js` | Supabase कनेक्शन (URL + anon key) |
| `setup.sql` | Database, security आणि storage सेटअप |

## सेटअप (एकदाच)
1. [supabase.com](https://supabase.com) वर नवीन project बनवा.
2. `setup.sql` मध्ये `your-email@gmail.com` च्या जागी तुमचा Gmail टाका, मग SQL Editor मध्ये run करा.
3. **Project Settings → API** मधून `Project URL` आणि `anon public` key कॉपी करून `supabase.js` मध्ये टाका.
   (`service_role` key कधीही टाकू नका.)
4. **Authentication → Providers → Google** चालू करा (Google Cloud मधून Client ID/Secret).
5. **Authentication → URL Configuration:** Site URL = `https://raviavdhut74-star.github.io/CampusBase/`,
   Redirect URLs मध्ये `https://raviavdhut74-star.github.io/CampusBase/admin.html` जोडा.
6. सर्व फाइल्स GitHub repo मध्ये upload करा (Pages चालू आहे).
7. `/admin.html` उघडा → Google login → PDF upload करा.

## टीप
- Admin फक्त `admins` टेबलमधील email असलेलेच होऊ शकतात. बाकीचे upload करू शकत नाहीत (database नियम).
- University/Branch/Year बदलायचे असल्यास `script.js` आणि `admin.js` दोन्हीमधील यादी सारखीच ठेवा.
