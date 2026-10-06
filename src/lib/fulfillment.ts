import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** The parts of a Dodo payment we rely on. */
export type DodoPayment = {
  payment_id: string;
  status?: string | null;
  total_amount: number;
  currency: string;
  metadata?: Record<string, string> | null;
  customer?: { email?: string | null } | null;
  product_cart?: { product_id: string; quantity?: number }[] | null;
};

export type DodoRefund = { payment_id: string; is_partial: boolean; status?: string | null };

/**
 * Grants access after a successful payment. Safe to call many times for the
 * same payment (webhook retries, success-page check): access is granted once.
 */
export async function fulfillPayment(payment: DodoPayment): Promise<{ orderId: string; granted: boolean }> {
  const db = createAdminClient();
  const meta = payment.metadata ?? {};
  let orderId = meta.order_id;

  if (orderId) {
    const { data: order, error } = await db.from("orders").select("id, user_id, template_id, status").eq("id", orderId).maybeSingle();
    if (error) throw error;
    if (!order) throw new Error(`Order ${orderId} from payment ${payment.payment_id} does not exist`);
    if (meta.user_id && order.user_id && meta.user_id !== order.user_id) {
      throw new Error(`Payment ${payment.payment_id} user does not match order ${orderId}`);
    }
    await assertProductMatches(order.template_id, payment);
  } else {
    // Payment made outside our checkout (e.g. a Dodo payment link): match it by product and email.
    const productId = payment.product_cart?.[0]?.product_id;
    const email = payment.customer?.email ?? "";
    const { data: tpl } = await db.from("templates").select("id, price_cents, currency").eq("dodo_product_id", productId ?? "__none__").maybeSingle();
    if (!tpl) throw new Error(`Payment ${payment.payment_id} has no order_id and an unknown product`);
    const { data: existing } = await db.from("orders").select("id").eq("payment_id", payment.payment_id).maybeSingle();
    if (existing) {
      orderId = existing.id;
    } else {
      const { data: profile } = await db.from("profiles").select("id").ilike("email", email).maybeSingle();
      const { data: created, error } = await db
        .from("orders")
        .insert({ user_id: profile?.id ?? null, template_id: tpl.id, amount_cents: tpl.price_cents, currency: tpl.currency, customer_email: email || "unknown" })
        .select("id")
        .single();
      if (error) throw error;
      orderId = created.id;
    }
  }

  const { data: granted, error } = await db.rpc("mark_order_paid", {
    p_order: orderId,
    p_payment_id: payment.payment_id,
    p_paid_amount: payment.total_amount,
    p_paid_currency: payment.currency,
  });
  if (error) throw error;
  return { orderId: orderId!, granted: Boolean(granted) };
}

async function assertProductMatches(templateId: string, payment: DodoPayment) {
  if (!payment.product_cart?.length) return;
  const db = createAdminClient();
  const { data: tpl } = await db.from("templates").select("dodo_product_id").eq("id", templateId).single();
  if (tpl?.dodo_product_id && !payment.product_cart.some((p) => p.product_id === tpl.dodo_product_id)) {
    throw new Error(`Payment ${payment.payment_id} was for a different product than its order`);
  }
}

export async function markPaymentUnsuccessful(payment: DodoPayment, status: "failed" | "cancelled") {
  const orderId = payment.metadata?.order_id;
  if (!orderId) return;
  const db = createAdminClient();
  await db.from("orders").update({ status, payment_id: payment.payment_id }).eq("id", orderId).eq("status", "pending");
}

/** A full refund removes access to the template. */
export async function applyRefund(refund: DodoRefund) {
  if (refund.is_partial) return;
  const db = createAdminClient();
  await db.from("orders").update({ status: "refunded" }).eq("payment_id", refund.payment_id).eq("status", "paid");
}
