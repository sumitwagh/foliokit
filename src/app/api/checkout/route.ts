import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dodo, isPaymentsConfigured } from "@/lib/dodo";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const Body = z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80) });

/** Starts a Dodo Payments checkout for one template (or the All-Access Pass). */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unknown template." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in to buy." }, { status: 401 });

  if (!isPaymentsConfigured()) {
    return NextResponse.json({ error: "Payments aren't set up on this store yet. Please try again later." }, { status: 503 });
  }

  const db = createAdminClient();
  const { data: tpl } = await db
    .from("templates")
    .select("id, name, kind, price_cents, currency, is_free, is_published, dodo_product_id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();
  if (!tpl || !tpl.is_published) return NextResponse.json({ error: "This template isn't available." }, { status: 404 });
  if (tpl.is_free) return NextResponse.json({ error: "This template is free. Use the download button instead." }, { status: 400 });
  if (!tpl.dodo_product_id) {
    return NextResponse.json({ error: "This template isn't connected to checkout yet. Please try again later." }, { status: 503 });
  }

  // Don't charge people twice.
  if (tpl.kind === "bundle") {
    const { data: owned } = await db.from("orders").select("id").eq("user_id", user.id).eq("template_id", tpl.id).eq("status", "paid").limit(1);
    if (owned?.length) return NextResponse.json({ alreadyOwned: true });
  } else {
    const { data: owned } = await db.rpc("has_access", { p_user: user.id, p_template: tpl.id });
    if (owned) return NextResponse.json({ alreadyOwned: true });
  }

  const { data: profile } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({ user_id: user.id, template_id: tpl.id, amount_cents: tpl.price_cents, currency: tpl.currency, customer_email: user.email! })
    .select("id")
    .single();
  if (orderError) {
    console.error("checkout: could not create order", orderError);
    return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 500 });
  }

  try {
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: tpl.dodo_product_id, quantity: 1 }],
      customer: { email: user.email!, name: profile?.full_name || user.email!.split("@")[0] },
      return_url: `${publicEnv.siteUrl}/checkout/success?order=${order.id}`,
      metadata: { order_id: order.id, user_id: user.id, template_id: tpl.id },
    });
    await db.from("orders").update({ checkout_session_id: session.session_id }).eq("id", order.id);
    if (!session.checkout_url) throw new Error("Dodo did not return a checkout URL");
    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error("checkout: Dodo error", error);
    await db.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: "The payment page could not be opened. Please try again in a minute." }, { status: 502 });
  }
}
