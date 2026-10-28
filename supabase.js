import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
export { CATALOG } from "./catalog.js";

// Supabase → Project Settings → API. Fakt anon (public) key; service_role kadhi nahi.
const SUPABASE_URL = "https://izymhzznimxuckkctwqx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eW1oenpuaW14dWNra2N0d3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODAxNjgsImV4cCI6MjEwODY1NjE2OH0.sdaB3yQgMg-2UpAL4kfemWLhEnVI55xGNJNYiwqkueI";

export const configured = !SUPABASE_URL.includes("YOUR-");
export const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export const BUCKET = "pdfs";

// setup.sql madhil is_admin() vaparto: email confirmed + admins list madhe asel tarach true
export async function isAdmin() {
  if (!supabase) return false;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export function toast(text) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = text;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}
