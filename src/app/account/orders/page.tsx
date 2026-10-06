import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusPill } from "@/components/account/StatusPill";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Order history", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, amount_cents, currency, paid_amount, paid_currency, created_at, paid_at, payment_id, template:templates(name, slug)")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as unknown as Order[];

  if (!orders.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-line-2 px-6 py-16 text-center">
        <h2 className="text-xl font-semibold">No orders yet</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-2">When you buy a template, its receipt details appear here.</p>
        <Link href="/templates" className="btn btn-primary mt-6">
          Browse templates
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <caption className="sr-only">Your orders</caption>
        <thead className="border-b border-line text-sm text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Item</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Reference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="whitespace-nowrap px-5 py-4">{formatDate(o.created_at)}</td>
              <td className="px-5 py-4 font-semibold">
                {o.template ? <Link href={`/templates/${o.template.slug}`} className="hover:text-plum">{o.template.name}</Link> : "Removed template"}
              </td>
              <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                {o.paid_amount != null && o.paid_currency ? formatMoney(o.paid_amount, o.paid_currency) : formatMoney(o.amount_cents, o.currency)}
              </td>
              <td className="px-5 py-4">
                <StatusPill status={o.status} />
              </td>
              <td className="px-5 py-4 font-mono text-[13px] text-muted">{o.payment_id ?? o.id.slice(0, 8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-5 py-4 text-sm text-muted">
        Receipts and tax invoices are emailed by Dodo Payments after each purchase. Amounts include any tax charged.
      </p>
    </div>
  );
}
