import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PaymentStatus } from "@/components/store/PaymentStatus";

export const metadata: Metadata = { title: "Thanks for your order", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ order?: string; payment_id?: string }> }) {
  const sp = await searchParams;
  await requireUser(`/checkout/success?order=${sp.order ?? ""}`);
  if (!sp.order || !/^[0-9a-f-]{36}$/i.test(sp.order)) redirect("/account");
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16">
      <PaymentStatus orderId={sp.order} paymentId={sp.payment_id} />
    </div>
  );
}
