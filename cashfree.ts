// Shared Cashfree helpers. Secrets: CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV (sandbox|production)
export const cfEnv = () => (Deno.env.get("CASHFREE_ENV") === "production" ? "production" : "sandbox");
export const cfBase = () => cfEnv() === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
export const cfHeaders = () => ({
  "x-client-id": Deno.env.get("CASHFREE_APP_ID")!,
  "x-client-secret": Deno.env.get("CASHFREE_SECRET_KEY")!,
  "x-api-version": "2023-08-01",
  "Content-Type": "application/json",
  "Accept": "application/json",
});

// Never trusts the browser or the webhook body: asks Cashfree directly whether the order is PAID,
// checks the amount against OUR database, then activates the plan (idempotent per order).
// deno-lint-ignore no-explicit-any
export async function settle(admin: any, orderId: string, userId?: string) {
  let q = admin.from("payment_orders").select("*").eq("order_id", orderId);
  if (userId) q = q.eq("user_id", userId);
  const { data: o } = await q.maybeSingle();
  if (!o) return { ok: false, status: "UNKNOWN_ORDER" };

  const r = await fetch(`${cfBase()}/orders/${encodeURIComponent(orderId)}`, { headers: cfHeaders() });
  const c = await r.json();
  if (!r.ok) return { ok: false, status: "GATEWAY_ERROR" };
  if (c.order_status !== "PAID") return { ok: false, status: c.order_status };
  if (Math.round(Number(c.order_amount) * 100) !== o.amount_paise) return { ok: false, status: "AMOUNT_MISMATCH" };

  const { data: exp, error } = await admin.rpc("activate_subscription", {
    p_user: o.user_id, p_plan: o.plan_id, p_order: orderId, p_amount: o.amount_paise,
  });
  if (error) throw new Error(error.message);
  await admin.from("payment_orders").update({ status: "paid" }).eq("order_id", orderId);
  return { ok: true, expires_at: exp };
}
