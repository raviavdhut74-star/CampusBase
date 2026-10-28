import { supabase } from "./supabase.js";
const link = document.getElementById("authLink");
if (supabase && link) {
  supabase.auth.getSession().then(({ data }) => {
    const s = data.session;
    if (!s) return;
    const first = (s.user.user_metadata?.full_name || "").trim().split(" ")[0];
    link.textContent = first ? "Logout (" + first + ")" : "Logout";
    link.href = "#";
    link.onclick = async (e) => { e.preventDefault(); await supabase.auth.signOut(); location.reload(); };
  });
}
