import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Template } from "@/lib/types";

const FIELDS =
  "id,slug,kind,name,tagline,description,category_id,tags,price_cents,currency,is_free,is_published,is_featured,features,included,tech_stack,pages,preview_url,accent_color,accent_ink,display_font,cover_path,gallery_paths,version,dodo_product_id,purchase_count,download_count,created_at,updated_at,category:categories(id,name,slug)";

export type SortKey = "popular" | "newest" | "price-asc" | "price-desc";
export const SORTS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export async function getCategoriesWithCounts(): Promise<(Category & { count: number })[]> {
  const db = createPublicClient();
  const [{ data: cats, error }, { data: rows }] = await Promise.all([
    db.from("categories").select("*").order("sort_order"),
    db.from("templates").select("category_id").eq("kind", "template"),
  ]);
  if (error) throw error;
  return (cats ?? []).map((c) => ({ ...c, count: (rows ?? []).filter((r) => r.category_id === c.id).length }));
}

export async function listTemplates(opts: {
  q?: string;
  category?: string;
  price?: "all" | "free" | "paid";
  sort?: SortKey;
} = {}): Promise<Template[]> {
  const db = createPublicClient();
  let query = db.from("templates").select(FIELDS).eq("kind", "template");

  if (opts.category) {
    const { data: cat } = await db.from("categories").select("id").eq("slug", opts.category).maybeSingle();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (opts.price === "free") query = query.eq("is_free", true);
  if (opts.price === "paid") query = query.eq("is_free", false);

  const q = opts.q?.trim().slice(0, 60);
  if (q) {
    // Escape characters that have meaning in the filter syntax.
    const safe = q.replace(/[%_,()\\.*]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,tagline.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  switch (opts.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_cents", { ascending: false });
      break;
    default:
      query = query.order("purchase_count", { ascending: false }).order("download_count", { ascending: false });
  }
  const { data, error } = await query;
  if (error) throw error;
  let list = (data ?? []) as unknown as Template[];
  // Tags are matched here so "dark" or "swiss" also finds templates.
  if (q) {
    const needle = q.toLowerCase();
    const { data: tagged } = await db.from("templates").select(FIELDS).eq("kind", "template").contains("tags", [needle]);
    for (const t of (tagged ?? []) as unknown as Template[]) {
      const passes =
        (!opts.category || t.category?.slug === opts.category) &&
        (opts.price !== "free" || t.is_free) &&
        (opts.price !== "paid" || !t.is_free);
      if (passes && !list.some((x) => x.id === t.id)) list = [...list, t];
    }
  }
  return list;
}

export async function getTemplate(slug: string): Promise<Template | null> {
  const db = createPublicClient();
  const { data, error } = await db.from("templates").select(FIELDS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as Template) ?? null;
}

export async function getShelf(): Promise<Template[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("templates")
    .select(FIELDS)
    .eq("kind", "template")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Template[];
}

export async function getBundle(): Promise<Template | null> {
  const db = createPublicClient();
  const { data } = await db.from("templates").select(FIELDS).eq("kind", "bundle").order("created_at").limit(1).maybeSingle();
  return (data as unknown as Template) ?? null;
}

export async function getTemplateCount(): Promise<number> {
  const db = createPublicClient();
  const { count } = await db.from("templates").select("id", { count: "exact", head: true }).eq("kind", "template");
  return count ?? 0;
}
