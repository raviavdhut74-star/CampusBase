import { sb, configured, BUCKET } from "./supabase.js";

const $ = s => document.querySelector(s);
const UNIS = ["SPPU", "DBATU", "RTMNU", "SGBAU"];
const BRANCHES = ["Computer", "IT", "Mechanical", "Civil", "Electrical", "E&TC"];
const YEARS = ["FE", "SE", "TE", "BE"];
const TYPES = { syllabus: "Syllabus", notes: "Notes", papers: "Question Papers", imp: "Important Questions" };
const MAX_MB = 20;

const opts = (el, arr) => el.innerHTML = arr.map(v => Array.isArray(v) ? `<option value="${v[0]}">${v[1]}</option>` : `<option>${v}</option>`).join("");
opts($("#uni"), UNIS); opts($("#branch"), BRANCHES); opts($("#year"), YEARS); opts($("#type"), Object.entries(TYPES));

let toastT;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2500); }

async function loadList() {
  const { data, error } = await sb.from("resources").select("*").order("created_at", { ascending: false });
  if (error) return toast(error.message);
  const ul = $("#list"); ul.innerHTML = "";
  if (!data.length) { ul.innerHTML = '<li class="none">Kahi upload kele nahi.</li>'; return; }
  data.forEach(r => {
    const li = document.createElement("li"), a = document.createElement("a"), s = document.createElement("span"), b = document.createElement("button");
    a.href = r.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = r.title;
    s.textContent = [r.uni, r.branch, r.year, TYPES[r.type] || r.type].join(" · ");
    b.className = "star"; b.textContent = "🗑"; b.setAttribute("aria-label", "Delete");
    b.onclick = async () => {
      if (!confirm('Delete "' + r.title + '"?')) return;
      if (r.path) await sb.storage.from(BUCKET).remove([r.path]);
      const { error: e } = await sb.from("resources").delete().eq("id", r.id);
      toast(e ? e.message : "Deleted"); loadList();
    };
    li.append(a, s, b); ul.append(li);
  });
}

if (!configured) {
  $("#msg").textContent = "supabase.js madhe Supabase config bhara."; $("#authBtn").disabled = true;
} else {
  $("#authBtn").onclick = async () => {
    const { data } = await sb.auth.getSession();
    data.session ? sb.auth.signOut() : sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.href } });
  };
  sb.auth.onAuthStateChange((_e, session) => {
    setTimeout(async () => {            // callback madhe thet await kela tar deadlock hou shakto
      const u = session?.user;
      $("#authBtn").textContent = u ? "Logout" : "Login with Google";
      let ok = false;
      if (u) ok = (await sb.rpc("is_admin")).data === true;
      $("#panel").hidden = !ok; $("#msg").hidden = ok;
      $("#msg").textContent = u ? "Ha account admin nahi." : "Admin login kara.";
      if (ok) loadList();
    }, 0);
  });
}

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const f = $("#file").files[0];
  if (!f || f.type !== "application/pdf") return toast("Fakt PDF file nivda");
  if (f.size > MAX_MB * 1048576) return toast("File " + MAX_MB + " MB peksha lahan pahije");
  const meta = { uni: $("#uni").value, branch: $("#branch").value, year: $("#year").value, type: $("#type").value, title: $("#title").value.trim() };
  const path = `${meta.uni}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
  $("#submit").disabled = true; $("#bar").hidden = false; $("#bar").removeAttribute("value");   // indeterminate
  try {
    const up = await sb.storage.from(BUCKET).upload(path, f, { contentType: "application/pdf" });
    if (up.error) throw up.error;
    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    const ins = await sb.from("resources").insert({ ...meta, url: data.publicUrl, path });
    if (ins.error) { await sb.storage.from(BUCKET).remove([path]); throw ins.error; }
    toast("Upload zale ✓"); $("#form").reset(); loadList();
  } catch (er) { toast(er.message); }
  $("#submit").disabled = false; $("#bar").hidden = true;
});
