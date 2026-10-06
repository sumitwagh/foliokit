import Form from "next/form";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusPill } from "@/components/account/StatusPill";
import type { Order } from "@/lib/types";

const STATUSES = ["all", "paid", "pending", "failed", "refunded", "cancelled"] as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number]) ? sp.status! : "paid";
  const q = (sp.q ?? "").trim().slice(0, 100);
  const db = createAdminClient();
  let query = db
    .from("orders")
    .select("id, status, amount_cents, currency, paid_amount, paid_currency, customer_email, payment_id, created_at, paid_at, template:templates(name, slug)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("customer_email", `%${q.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  const orders = (data ?? []) as unknown as Order[];
  const total = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount_cents, 0);

  return (
    <div className="grid gap-6">
      <h1 className="text-[34px] font-semibold tracking-[-0.03em]">Orders</h1>
      <Form action="/admin/orders" className="flex flex-wrap gap-2">
        <label className="flex-1">
          <span className="sr-only">Search by email</span>
          <input name="q" defaultValue={q} placeholder="Search by customer email" className="input" />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select name="status" defaultValue={status} className="input w-44">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="submit">
          Filter
        </button>
      </Form>
      <p className="text-sm text-muted">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
        {status === "paid" || status === "all" ? `, ${formatMoney(total)} paid` : ""}. Refunds are issued from your Dodo Payments dashboard and show up here automatically.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Template</th>
              <th className="px-3 py-3 font-medium">List price</th>
              <th className="px-3 py-3 font-medium">Charged</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Dodo payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="whitespace-nowrap px-5 py-3">{formatDate(o.created_at)}</td>
                <td className="px-3 py-3">{o.customer_email}</td>
                <td className="px-3 py-3 font-semibold">{o.template?.name}</td>
                <td className="px-3 py-3 tabular-nums">{formatMoney(o.amount_cents, o.currency)}</td>
                <td className="px-3 py-3 tabular-nums">{o.paid_amount != null && o.paid_currency ? formatMoney(o.paid_amount, o.paid_currency) : "–"}</td>
                <td className="px-3 py-3">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-5 py-3 font-mono text-[12px] text-muted">{o.payment_id ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="px-5 py-10 text-center text-ink-2">No orders match.</p>}
      </div>
    </div>
  );
}
