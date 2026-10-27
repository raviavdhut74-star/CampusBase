(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Data (admin.js shi match asaleli pahije) ---------- */
const UNIS = [
  { code: "SPPU",  name: "Savitribai Phule Pune University",          city: "Pune",    icon: "🏛️" },
  { code: "DBATU", name: "Dr. Babasaheb Ambedkar Technological University", city: "Lonere", icon: "🎓" },
  { code: "RTMNU", name: "Rashtrasant Tukadoji Maharaj Nagpur University", city: "Nagpur", icon: "📖" },
  { code: "SGBAU", name: "Sant Gadge Baba Amravati University",       city: "Amravati", icon: "🏫" }
];
const BRANCHES = ["Computer", "IT", "Mechanical", "Civil", "Electrical", "E&TC"];
const YEARS = ["FE", "SE", "TE", "BE"];
const TYPES = { syllabus: "Syllabus", notes: "Notes", papers: "Question Papers", imp: "Important Questions" };

/* ---------- Helpers ---------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
let toastT;
function toast(m) {
  const t = $("#toast"); t.textContent = m; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
}
const sbReady = import("./supabase.js").then(m => m.sb).catch(() => null);

/* ---------- Theme ---------- */
const root = document.documentElement;
function setTheme(t) { root.dataset.theme = t; $("#themeBtn").textContent = t === "dark" ? "🌙" : "☀️"; store.set("cb_theme", t); }
setTheme(store.get("cb_theme", "dark"));
$("#themeBtn").onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");

/* ---------- Mobile menu ---------- */
const nav = $("#navLinks"), menuBtn = $("#menuBtn");
menuBtn.onclick = () => { const o = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); };
nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

/* ---------- Scroll: progress bar, back-to-top ---------- */
const bar = $("#progress"), toTop = $("#toTop");
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%";
  toTop.hidden = scrollY < 400;
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();
toTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });

/* ---------- Footer year + hero counters ---------- */
$("#year").textContent = new Date().getFullYear();
const counts = [UNIS.length, BRANCHES.length];
$$("[data-count]").forEach((el, i) => {
  const end = counts[i] ?? +el.dataset.count;
  let n = 0; const step = Math.max(1, Math.ceil(end / 20));
  const id = setInterval(() => { n = Math.min(end, n + step); el.textContent = n; if (n >= end) clearInterval(id); }, 60);
});

/* ---------- University cards + search ---------- */
const grid = $("#uniGrid");
UNIS.forEach((u, i) => {
  const c = document.createElement("article");
  c.className = "university-card reveal";
  c.dataset.search = (u.code + " " + u.name + " " + u.city).toLowerCase();
  c.innerHTML = '<span class="uni-number"></span><span class="uni-icon"></span><h3></h3><p></p>';
  $(".uni-number", c).textContent = String(i + 1).padStart(2, "0");
  $(".uni-icon", c).textContent = u.icon;
  $("h3", c).textContent = u.code;
  $("p", c).textContent = u.name + " · " + u.city;
  const b = document.createElement("button");
  b.className = "uni-btn"; b.type = "button"; b.textContent = "View Material";
  b.onclick = () => openModal(u);
  c.append(b); grid.append(c);
});
$("#search").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase(); let n = 0;
  $$(".university-card").forEach(c => { const ok = c.dataset.search.includes(q); c.hidden = !ok; if (ok) n++; });
  $("#empty").hidden = n > 0;
});

/* ---------- Reveal on scroll + active nav ---------- */
$$(".resource-card, .section-heading, .notice").forEach(el => el.classList.add("reveal"));
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12 }) : null;
$$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
if ("IntersectionObserver" in window) {
  const links = $$(".nav-links a");
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => so.observe(s));
}

/* ---------- Saved material ---------- */
let saved = store.get("cb_saved", []);
const isSaved = id => saved.some(s => s.id === String(id));
function renderSaved() {
  $("#savedCount").textContent = saved.length;
  const ul = $("#savedList"); ul.innerHTML = "";
  if (!saved.length) { const li = document.createElement("li"); li.className = "none"; li.textContent = "Nothing saved yet."; ul.append(li); return; }
  saved.forEach(s => {
    const li = document.createElement("li"), a = document.createElement("a"), m = document.createElement("span"), b = document.createElement("button");
    a.href = s.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = s.title;
    m.textContent = s.meta;
    b.className = "star"; b.textContent = "★"; b.setAttribute("aria-label", "Remove from saved");
    b.onclick = () => { toggleSave(s); };
    li.append(a, m, b); ul.append(li);
  });
}
function toggleSave(r) {
  const id = String(r.id);
  if (isSaved(id)) { saved = saved.filter(s => s.id !== id); toast("Removed from saved"); }
  else { saved.push({ id, title: r.title, url: r.url, meta: r.meta }); toast("Saved ✓"); }
  store.set("cb_saved", saved); renderSaved();
  $$("#resList .star").forEach(b => { if (b.dataset.id === id) b.textContent = isSaved(id) ? "★" : "☆"; });
}
renderSaved();

/* ---------- Modal ---------- */
const modal = $("#modal"), fB = $("#fBranch"), fY = $("#fYear"), tabs = $("#tabs"), list = $("#resList");
fB.innerHTML = BRANCHES.map(b => `<option>${b}</option>`).join("");
fY.innerHTML = YEARS.map(y => `<option>${y}</option>`).join("");
let cur = null, curType = "syllabus", token = 0;
Object.entries(TYPES).forEach(([k, v]) => {
  const b = document.createElement("button");
  b.type = "button"; b.role = "tab"; b.dataset.type = k; b.textContent = v;
  b.onclick = () => { curType = k; syncTabs(); load(); };
  tabs.append(b);
});
function syncTabs() { $$("button", tabs).forEach(b => b.setAttribute("aria-selected", b.dataset.type === curType)); }
function note(msg) { list.innerHTML = ""; const li = document.createElement("li"); li.className = "none"; li.textContent = msg; list.append(li); }
function openModal(u) {
  cur = u; $("#mTitle").textContent = u.code + " — " + u.name;
  curType = "syllabus"; syncTabs(); load(); modal.showModal();
}
async function load() {
  const my = ++token, sb = await sbReady;
  if (!sb) return note("Study material will appear here soon.");
  note("Loading…");
  const { data, error } = await sb.from("resources").select("*")
    .eq("uni", cur.code).eq("branch", fB.value).eq("year", fY.value).eq("type", curType)
    .order("created_at", { ascending: false });
  if (my !== token) return;
  if (error) return note("Could not load material. Try again.");
  if (!data.length) return note("No material uploaded yet for this selection.");
  list.innerHTML = "";
  data.forEach(r => {
    const li = document.createElement("li"), a = document.createElement("a"), b = document.createElement("button");
    a.href = r.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = r.title;
    b.className = "star"; b.dataset.id = r.id; b.textContent = isSaved(r.id) ? "★" : "☆"; b.setAttribute("aria-label", "Save");
    b.onclick = () => toggleSave({ id: r.id, title: r.title, url: r.url, meta: [r.uni, r.branch, r.year, TYPES[r.type]].join(" · ") });
    li.append(a, b); list.append(li);
  });
}
fB.onchange = fY.onchange = load;
$("#mClose").onclick = () => modal.close();
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
})();
