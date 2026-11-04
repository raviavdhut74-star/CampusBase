import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json } from "../_shared/util.ts";
import { cfBase, cfEnv, cfHeaders } from "../_shared/cashfree.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authed = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await authed.auth.getUser();
    if (!user) return json({ error: "Login required" }, 401);

    const body = await req.json();
    const phone = String(body.phone ?? "");
    if (!/^[6-9]\d{9}$/.test(phone)) return json({ error: "Invalid mobile number" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: plan } = await admin.from("plans").select("*").eq("id", body.plan_id).eq("active", true).maybeSingle();
    if (!plan) return json({ error: "Invalid plan" }, 400);   // price always comes from DB, never from the browser

    const orderId = "cb_" + crypto.randomUUID().replaceAll("-", "");
    const site = (Deno.env.get("SITE_URL") ?? "").trim();
    const r = await fetch(`${cfBase()}/orders`, {
      method: "POST", headers: cfHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: plan.price_paise / 100,
        order_currency: "INR",
        order_note: `CampusBase ${plan.name}`,
        customer_details: { customer_id: user.id, customer_email: user.email, customer_phone: phone },
        order_meta: {
          return_url: site ? `${site}?order_id={order_id}` : undefined,
          notify_url: `${url}/functions/v1/cashfree-webhook`,
        },
      }),
    });
    const o = await r.json();
    if (!r.ok || !o.payment_session_id) return json({ error: o?.message ?? "Cashfree error" }, 502);

    const { error } = await admin.from("payment_orders").insert({
      order_id: orderId, user_id: user.id, plan_id: plan.id, amount_paise: plan.price_paise,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ order_id: orderId, payment_session_id: o.payment_session_id, mode: cfEnv() });
  } catch (e) { return json({ error: String(e) }, 500); }
});
