// Supabase connection. Only the anon (public) key goes here — never the service_role key.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const SUPABASE_URL = "https://izymhzznimxuckkctwqx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eW1oenpuaW14dWNra2N0d3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODAxNjgsImV4cCI6MjEwODY1NjE2OH0.sdaB3yQgMg-2UpAL4kfemWLhEnVI55xGNJNYiwqkueI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const BUCKET = "pdfs";

// true only if the email is confirmed AND listed in the admins table (see database/setup.sql)
export async function isAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}
