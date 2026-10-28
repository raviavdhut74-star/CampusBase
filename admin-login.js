import { supabase, isAdmin } from "./supabase.js";
const $ = (id) => document.getElementById(id);
const say = (t) => { $("msg").textContent = t; };

document.querySelectorAll("[data-eye]").forEach((b) => {
  b.onclick = () => { const i = $(b.dataset.eye); i.type = i.type === "password" ? "text" : "password"; };
});

if (!supabase) { say("supabase.js madhe Supabase config bhara."); $("submit").disabled = true; }
else isAdmin().then((ok) => { if (ok) location.replace("admin.html"); });

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  say("");
  $("submit").disabled = true;
  const { error } = await supabase.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
  if (error) {
    say(error.message.includes("Email not confirmed") ? "Pehle email confirm kara (inbox/spam)." : "Email kiva password chukicha aahe.");
  } else if (await isAdmin()) {
    location.replace("admin.html");
    return;
  } else {
    await supabase.auth.signOut();
    say("Ha account admin nahi (kiva email confirm nahi / admins list madhe nahi).");
  }
  $("submit").disabled = false;
});
