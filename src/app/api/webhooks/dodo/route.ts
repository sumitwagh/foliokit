import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyRefund, fulfillPayment, markPaymentUnsuccessful, type DodoPayment, type DodoRefund } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

/**
 * Dodo Payments calls this URL after every payment event.
 * 1. Check the signature (proves the message really came from Dodo).
 * 2. Skip events we've already handled (Dodo retries on failure).
 * 3. Grant access, mark failures, or revoke on refund.
 */
export async function POST(request: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  const body = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = new Webhook(secret).verify(body, headers) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const db = createAdminClient();
  const id = headers["webhook-id"];
  const { data: inserted, error: insertError } = await db
    .from("webhook_events")
    .upsert({ id, type: event.type, payload: event }, { onConflict: "id", ignoreDuplicates: true })
    .select("id");
  if (insertError) {
    console.error("webhook: could not record event", insertError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!inserted?.length) {
    const { data: seen } = await db.from("webhook_events").select("processed_at").eq("id", id).single();
    if (seen?.processed_at) return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "payment.succeeded":
        await fulfillPayment(event.data as unknown as DodoPayment);
        break;
      case "payment.failed":
        await markPaymentUnsuccessful(event.data as unknown as DodoPayment, "failed");
        break;
      case "payment.cancelled":
        await markPaymentUnsuccessful(event.data as unknown as DodoPayment, "cancelled");
        break;
      case "refund.succeeded":
        await applyRefund(event.data as unknown as DodoRefund);
        break;
      default:
        // Other events (payouts, disputes…) are stored but need no action.
        break;
    }
    await db.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null }).eq("id", id);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("webhook: processing failed", message);
    await db.from("webhook_events").update({ error: message.slice(0, 500) }).eq("id", id);
    // A 500 makes Dodo retry later, which fixes temporary problems automatically.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
