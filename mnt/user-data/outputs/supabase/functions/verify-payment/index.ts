import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json } from "../_shared/util.ts";
import { settle } from "../_shared/cashfree.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authed = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await authed.auth.getUser();
    if (!user) return json({ error: "Login required" }, 401);

    const { order_id } = await req.json();
    if (!order_id || typeof order_id !== "string") return json({ error: "Missing order_id" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    return json(await settle(admin, order_id, user.id));   // only the order's owner can settle it
  } catch (e) { return json({ error: String(e) }, 500); }
});
