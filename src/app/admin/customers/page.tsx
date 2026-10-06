import Form from "next/form";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney } from "@/lib/format";

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100).replace(/[%_,()]/g, "");
  const db = createAdminClient();
  let query = db.from("profiles").select("id, email, full_name, role, marketing_opt_in, created_at").order("created_at", { ascending: false }).limit(300);
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  const [{ data: people }, { data: orders }, { data: downloads }] = await Promise.all([
    query,
    db.from("orders").select("user_id, amount_cents").eq("status", "paid"),
    db.from("downloads").select("user_id"),
  ]);
  const spend = new Map<string, { n: number; cents: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const s = spend.get(o.user_id) ?? { n: 0, cents: 0 };
    spend.set(o.user_id, { n: s.n + 1, cents: s.cents + o.amount_cents });
  }
  const dl = new Map<string, number>();
  for (const d of downloads ?? []) if (d.user_id) dl.set(d.user_id, (dl.get(d.user_id) ?? 0) + 1);
  const optIns = (people ?? []).filter((p) => p.marketing_opt_in);

  return (
    <div className="grid gap-6">
      <h1 className="text-[34px] font-semibold tracking-[-0.03em]">Customers</h1>
      <Form action="/admin/customers" className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Search customers</span>
          <input name="q" defaultValue={q} placeholder="Search by name or email" className="input" />
        </label>
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </Form>
      <p className="text-sm text-muted">
        {people?.length ?? 0} people. {optIns.length} agreed to receive emails about new templates.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Joined</th>
              <th className="px-3 py-3 text-right font-medium">Purchases</th>
              <th className="px-3 py-3 text-right font-medium">Spent</th>
              <th className="px-3 py-3 text-right font-medium">Downloads</th>
              <th className="px-5 py-3 font-medium">Emails OK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(people ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <span className="block font-semibold">
                    {p.full_name || "No name"}
                    {p.role === "admin" && <span className="ml-2 rounded-full bg-lilac px-2 py-0.5 text-xs text-plum">Admin</span>}
                  </span>
                  <span className="text-muted">{p.email}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3">{formatDate(p.created_at)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{spend.get(p.id)?.n ?? 0}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatMoney(spend.get(p.id)?.cents ?? 0)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{dl.get(p.id) ?? 0}</td>
                <td className="px-5 py-3">{p.marketing_opt_in ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!people?.length && <p className="px-5 py-10 text-center text-ink-2">No customers found.</p>}
      </div>
    </div>
  );
}
