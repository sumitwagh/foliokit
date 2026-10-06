import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney } from "@/lib/format";
import { isPaymentsConfigured } from "@/lib/dodo";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusPill } from "@/components/account/StatusPill";
import type { Order } from "@/lib/types";

export default async function AdminOverview() {
  const db = createAdminClient();
  const since = new Date(Date.now() - 29 * 86400000);
  since.setUTCHours(0, 0, 0, 0);

  const [paidRes, recentRes, customersRes, newCustomersRes, downloadsRes, downloads30Res, templatesRes, filesRes] = await Promise.all([
    db.from("orders").select("amount_cents, paid_at").eq("status", "paid"),
    db.from("orders").select("id, status, amount_cents, currency, customer_email, created_at, template:templates(name, slug)").neq("status", "cancelled").order("created_at", { ascending: false }).limit(8),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since.toISOString()),
    db.from("downloads").select("id", { count: "exact", head: true }),
    db.from("downloads").select("id", { count: "exact", head: true }).gte("created_at", since.toISOString()),
    db.from("templates").select("id, name, slug, kind, is_free, is_published, dodo_product_id, purchase_count, download_count").order("purchase_count", { ascending: false }),
    db.from("template_files").select("template_id"),
  ]);

  const paid = paidRes.data ?? [];
  const total = paid.reduce((s, o) => s + o.amount_cents, 0);
  const last30 = paid.filter((o) => o.paid_at && new Date(o.paid_at) >= since);
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
    const list = last30.filter((o) => o.paid_at!.slice(0, 10) === d);
    return { date: d, cents: list.reduce((s, o) => s + o.amount_cents, 0), orders: list.length };
  });
  const templates = templatesRes.data ?? [];
  const withFiles = new Set((filesRes.data ?? []).map((f) => f.template_id));
  const problems = [
    !isPaymentsConfigured() && "Dodo Payments keys are missing, so nobody can buy yet.",
    ...templates.filter((t) => t.kind === "template" && t.is_published && !withFiles.has(t.id)).map((t) => `${t.name} has no downloadable file yet.`),
    ...templates.filter((t) => t.is_published && !t.is_free && !t.dodo_product_id).map((t) => `${t.name} isn't connected to Dodo Payments. Open it and press Save.`),
  ].filter(Boolean) as string[];

  return (
    <div className="grid gap-8">
      <h1 className="text-[34px] font-semibold tracking-[-0.03em]">Overview</h1>

      {problems.length > 0 && (
        <div className="rounded-2xl bg-warn-bg p-5 text-warn" role="status">
          <p className="font-semibold">Before you can sell everything:</p>
          <ul className="mt-2 list-disc pl-5 text-[15px]">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue, all time" value={formatMoney(total)} note={`${paid.length} paid orders`} />
        <Stat label="Revenue, last 30 days" value={formatMoney(days.reduce((s, d) => s + d.cents, 0))} note={`${last30.length} orders`} />
        <Stat label="Customers" value={String(customersRes.count ?? 0)} note={`${newCustomersRes.count ?? 0} new in 30 days`} />
        <Stat label="Downloads" value={String(downloadsRes.count ?? 0)} note={`${downloads30Res.count ?? 0} in 30 days`} />
      </dl>
      <p className="-mt-4 text-sm text-muted">Revenue shows your list prices before Dodo Payments fees. Your exact payouts are in the Dodo dashboard.</p>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Revenue per day</h2>
        <div className="mt-4">
          <RevenueChart days={days} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-x-auto">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold underline underline-offset-4">
              All orders
            </Link>
          </div>
          {(recentRes.data ?? []).length ? (
            <table className="mt-3 w-full min-w-[460px] text-left text-[14px]">
              <tbody className="divide-y divide-line">
                {((recentRes.data ?? []) as unknown as Order[]).map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-3">
                      <span className="font-semibold">{o.template?.name}</span>
                      <span className="block truncate text-muted">{o.customer_email}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{formatMoney(o.amount_cents, o.currency)}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-muted">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 pb-6 pt-3 text-ink-2">No orders yet. Your first sale will show up here.</p>
          )}
        </section>
        <section className="card overflow-x-auto">
          <h2 className="px-6 pt-5 text-lg font-semibold">Templates</h2>
          <table className="mt-3 w-full min-w-[420px] text-left text-[14px]">
            <thead className="text-muted">
              <tr>
                <th className="px-6 py-2 font-medium">Template</th>
                <th className="px-3 py-2 text-right font-medium">Sales</th>
                <th className="px-6 py-2 text-right font-medium">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-3">
                    <Link href={`/admin/templates/${t.id}`} className="font-semibold hover:text-plum">
                      {t.name}
                    </Link>
                    {!t.is_published && <span className="ml-2 text-muted">(draft)</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{t.is_free ? "Free" : t.purchase_count}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{t.download_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card p-5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value}</dd>
      <dd className="mt-2 text-sm text-ink-2">{note}</dd>
    </div>
  );
}
