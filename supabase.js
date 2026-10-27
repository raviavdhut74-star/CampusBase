import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

// Supabase Dashboard > Project Settings > API madhun copy kara
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eW1oenpuaW14dWNra2N0d3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODAxNjgsImV4cCI6MjEwODY1NjE2OH0.sdaB3yQgMg-2UpAL4kfemWLhEnVI55xGNJNYiwqkueI";   // anon (public) key — service_role key kadhi taku naka

export const BUCKET = "pdfs";
export const configured = !SUPABASE_URL.startsWith("YOUR_");
export const sb = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
