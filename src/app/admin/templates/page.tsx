import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { FormAlert } from "@/components/auth/Field";

export default async function AdminTemplates({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const sp = await searchParams;
  const db = createAdminClient();
  const [{ data: templates }, { data: files }] = await Promise.all([
    db.from("templates").select("id, name, slug, kind, price_cents, is_free, is_published, is_featured, cover_path, accent_color, dodo_product_id, purchase_count, download_count, category:categories(name)").order("created_at"),
    db.from("template_files").select("template_id"),
  ]);
  const hasFile = new Set((files ?? []).map((f) => f.template_id));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em]">Templates</h1>
        <Link href="/admin/templates/new" className="btn btn-primary">
          Add a template
        </Link>
      </div>
      {sp.deleted && <FormAlert tone="success">Template deleted.</FormAlert>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Template</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Ready to sell</th>
              <th className="px-3 py-3 text-right font-medium">Sales</th>
              <th className="px-5 py-3 text-right font-medium">Downloads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(templates ?? []).map((t) => {
              const cover = imageUrl(t.cover_path);
              const missing = [
                t.kind === "template" && !hasFile.has(t.id) && "no file",
                !t.is_free && !t.dodo_product_id && "not on Dodo",
              ].filter(Boolean);
              return (
                <tr key={t.id} className="hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/templates/${t.id}`} className="flex items-center gap-3">
                      <span className="h-10 w-16 shrink-0 overflow-hidden rounded-lg" style={{ background: t.accent_color }}>
                        {cover && <img src={cover} alt="" className="h-full w-full object-cover object-top" />}
                      </span>
                      <span>
                        <span className="block font-semibold hover:text-plum">{t.name}</span>
                        <span className="text-muted">{t.kind === "bundle" ? "All-access bundle" : ((t.category as unknown as { name: string } | null)?.name ?? "No category")}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{formatPrice(t.price_cents)}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${t.is_published ? "bg-ok-bg text-ok" : "bg-paper text-muted"}`}>{t.is_published ? "Published" : "Draft"}</span>
                    {t.is_featured && <span className="ml-1.5 rounded-full bg-lilac px-2.5 py-1 text-[13px] font-semibold text-plum">Featured</span>}
                  </td>
                  <td className="px-3 py-3">{missing.length ? <span className="text-warn">Missing: {missing.join(", ")}</span> : <span className="text-ok">Yes</span>}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{t.purchase_count}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{t.download_count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!templates?.length && <p className="px-5 py-10 text-center text-ink-2">No templates yet. Add your first one.</p>}
      </div>
    </div>
  );
}
