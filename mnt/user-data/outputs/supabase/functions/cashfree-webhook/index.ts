// Backup path: activates the plan even if the student closes the tab right after paying.
// Deploy with:  supabase functions deploy cashfree-webhook --no-verify-jwt
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmacB64, safeEq } from "../_shared/util.ts";
import { settle } from "../_shared/cashfree.ts";

Deno.serve(async (req) => {
  const raw = await req.text();
  const ts = req.headers.get("x-webhook-timestamp") ?? "";
  const sig = req.headers.get("x-webhook-signature") ?? "";
  const expected = await hmacB64(Deno.env.get("CASHFREE_SECRET_KEY")!, ts + raw);   // base64(HMAC-SHA256(timestamp + rawBody))
  if (!safeEq(expected, sig)) return new Response("bad signature", { status: 400 });

  let orderId = "";
  try { orderId = JSON.parse(raw)?.data?.order?.order_id ?? ""; } catch { /* ignore */ }
  if (!orderId) return new Response("ok");   // e.g. dashboard test ping

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try { await settle(admin, orderId); }       // re-checks with Cashfree, so the body itself is never trusted
  catch (e) { return new Response(String(e), { status: 500 }); }   // 500 => Cashfree retries
  return new Response("ok");
});
