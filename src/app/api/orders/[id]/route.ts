import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dodo, isPaymentsConfigured } from "@/lib/dodo";
import { fulfillPayment, type DodoPayment } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

/**
 * Used by the "Thanks for your order" page to wait for payment confirmation.
 * If the webhook is slow, it double-checks the payment directly with Dodo.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Security rules only return the order if it belongs to this user.
  const { data: order } = await supabase.from("orders").select("id, status, template:templates(slug, name, kind)").eq("id", id).maybeSingle();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const paymentId = new URL(request.url).searchParams.get("payment_id");
  if (order.status === "pending" && paymentId && /^[A-Za-z0-9_]{4,64}$/.test(paymentId) && isPaymentsConfigured()) {
    try {
      const payment = (await dodo().payments.retrieve(paymentId)) as unknown as DodoPayment;
      if (payment.status === "succeeded" && payment.metadata?.order_id === order.id) {
        await fulfillPayment(payment);
        return NextResponse.json({ status: "paid", template: order.template });
      }
    } catch (error) {
      console.error("order status: Dodo lookup failed", error);
    }
  }
  return NextResponse.json({ status: order.status, template: order.template });
}
