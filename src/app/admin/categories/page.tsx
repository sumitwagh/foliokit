import { createAdminClient } from "@/lib/supabase/admin";
import { CategoryRow } from "@/components/admin/CategoryRow";

export default async function AdminCategories() {
  const db = createAdminClient();
  const [{ data: cats }, { data: tpls }] = await Promise.all([db.from("categories").select("*").order("sort_order"), db.from("templates").select("category_id")]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[34px] font-semibold tracking-[-0.03em]">Categories</h1>
        <p className="mt-1 text-ink-2">Categories group templates on the browse page. Deleting one doesn&apos;t delete its templates.</p>
      </div>
      <div className="grid gap-3">
        {(cats ?? []).map((c) => (
          <CategoryRow key={c.id} c={c} count={(tpls ?? []).filter((t) => t.category_id === c.id).length} />
        ))}
      </div>
      <h2 className="text-lg font-semibold">Add a category</h2>
      <CategoryRow />
    </div>
  );
}
