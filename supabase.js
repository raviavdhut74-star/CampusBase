import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

// Supabase Dashboard > Project Settings > API madhun copy kara
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";   // anon (public) key — service_role key kadhi taku naka

export const BUCKET = "pdfs";
export const configured = !SUPABASE_URL.startsWith("YOUR_");
export const sb = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
