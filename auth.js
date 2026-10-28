import { supabase } from "./supabase.js";
import { CATALOG } from "./catalog.js";

const $ = (id) => document.getElementById(id);
const isRecovery = location.hash.includes("type=recovery");   // password-reset link varun alo ka?
let mode = "login";

const MODES = {
  login:    { title: "Welcome back", sub: "Log in to continue to CampusBase.", btn: "Login",
              show: ["emailRow", "passRow", "forgotLink"] },
  register: { title: "Create your account", sub: "It's free and takes a minute.", btn: "Register",
              show: ["nameRow", "regRow", "uniRow", "emailRow", "passRow", "pass2Row"] },
  forgot:   { title: "Reset password", sub: "We'll email you a link to set a new password.", btn: "Send reset link",
              show: ["emailRow", "backLink"] },
  reset:    { title: "Set a new password", sub: "Choose a new password for your account.", btn: "Update password",
              show: ["passRow", "pass2Row"] },
};
const ALL = ["nameRow", "regRow", "uniRow", "emailRow", "passRow", "pass2Row", "forgotLink", "backLink"];

function say(text, ok = false) { const m = $("msg"); m.textContent = text; m.className = "form-msg" + (ok ? " ok" : ""); }

function setMode(m) {
  mode = m;
  const c = MODES[m];
  ALL.forEach((id) => { $(id).hidden = !c.show.includes(id); });
  $("title").textContent = c.title;
  $("sub").textContent = c.sub;
  $("submit").textContent = c.btn;
  $("authTabs").hidden = m === "forgot" || m === "reset";
  $("tabLogin").setAttribute("aria-selected", String(m === "login"));
  $("tabReg").setAttribute("aria-selected", String(m === "register"));
  $("password").autocomplete = (m === "register" || m === "reset") ? "new-password" : "current-password";
  say("");
}

// dropdowns
$("uni").replaceChildren(new Option("Select university", ""), ...CATALOG.universities.map((u) => new Option(u.code + " — " + u.name, u.code)));
$("year").replaceChildren(new Option("Select", ""), ...CATALOG.years.map((y) => new Option(y, y)));

// show / hide password
document.querySelectorAll("[data-eye]").forEach((b) => {
  b.onclick = () => {
    const i = $(b.dataset.eye), show = i.type === "password";
    i.type = show ? "text" : "password";
    b.setAttribute("aria-label", show ? "Hide password" : "Show password");
  };
});

$("tabLogin").onclick = () => setMode("login");
$("tabReg").onclick = () => setMode("register");
$("forgotLink").onclick = (e) => { e.preventDefault(); setMode("forgot"); };
$("backLink").onclick = (e) => { e.preventDefault(); setMode("login"); };

if (!supabase) {
  setMode("login"); say("Site is not configured yet (supabase.js)."); $("submit").disabled = true;
} else {
  if (isRecovery) setMode("reset");
  else {
    setMode(new URLSearchParams(location.search).get("mode") === "register" ? "register" : "login");
    supabase.auth.getSession().then(({ data }) => { if (data.session) location.replace("index.html"); });
  }
  supabase.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") setMode("reset"); });
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const email = $("email").value.trim();
  const password = $("password").value;
  const EMAIL_RE = /^\S+@\S+\.\S+$/;

  if (mode !== "reset" && !EMAIL_RE.test(email)) return say("Enter a valid email address.");
  if (mode !== "forgot" && password.length < (mode === "login" ? 1 : 8)) return say(mode === "login" ? "Enter your password." : "Password must be at least 8 characters.");

  let meta = null;
  if (mode === "register") {
    const name = $("name").value.trim(), mobile = $("mobile").value.trim(), uni = $("uni").value, year = $("year").value;
    if (name.length < 2) return say("Enter your full name.");
    if (!/^[6-9]\d{9}$/.test(mobile)) return say("Enter a valid 10-digit mobile number.");
    if (!year) return say("Select your year.");
    if (!uni) return say("Select your university.");
    if (password !== $("password2").value) return say("Passwords do not match.");
    meta = { full_name: name, mobile, university: uni, year };
  }
  if (mode === "reset" && password !== $("password2").value) return say("Passwords do not match.");

  $("submit").disabled = true;
  try {
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) say(error.message.includes("Email not confirmed") ? "Please confirm your email first (check inbox / spam)." : "Incorrect email or password.");
      else location.replace("index.html");
    } else if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: meta, emailRedirectTo: location.origin + location.pathname.replace("auth.html", "index.html") },
      });
      if (error) say(error.message);
      else if (data.session) location.replace("index.html");
      else if (data.user && data.user.identities && data.user.identities.length === 0) say("This email is already registered. Please log in.");
      else say("Account created! We sent a confirmation link to your email — click it, then log in.", true);
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      if (error) say(error.message);
      else say("If an account exists for this email, a reset link is on its way.", true);
    } else if (mode === "reset") {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) say(error.message);
      else { say("Password updated ✓ Redirecting…", true); setTimeout(() => location.replace("index.html"), 1200); }
    }
  } catch (err) {
    say("Something went wrong. Check your internet and try again.");
  }
  $("submit").disabled = false;
});
