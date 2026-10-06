"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncDodoProduct } from "@/lib/dodo-sync";
import { slugify } from "@/lib/format";

export type AdminState = { error?: string; success?: string; warning?: string; fieldErrors?: Record<string, string> };

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const commas = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const TemplateInput = z
  .object({
    name: z.string().trim().min(2, "Give the template a name (2+ characters).").max(80),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes, like studio-verne."),
    kind: z.enum(["template", "bundle"]),
    tagline: z.string().trim().max(160, "Keep the tagline under 160 characters."),
    description: z.string().trim().max(5000),
    category_id: z.string().uuid().nullable(),
    price_cents: z.number().int().min(0).max(100000, "Price must be $1,000 or less."),
    is_free: z.boolean(),
    is_published: z.boolean(),
    is_featured: z.boolean(),
    preview_url: z
      .string()
      .trim()
      .refine((v) => !v || v.startsWith("/") || /^https:\/\//.test(v), "Use a link starting with https:// or /")
      .nullable(),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex colour like #2E2BFF."),
    accent_ink: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex colour like #FFFFFF."),
    display_font: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9 ]{2,40}$/, "Use a Google Fonts family name, like Bodoni Moda.")
      .nullable(),
    version: z.string().trim().min(1).max(20),
    dodo_product_id: z.string().trim().max(80).nullable(),
  })
  .refine((t) => t.is_free || t.price_cents > 0, { path: ["price"], message: "Paid templates need a price, or tick “Free”." });

/** Create or update a template. */
export async function saveTemplate(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "") || null;
  const name = String(form.get("name") ?? "");
  const priceText = String(form.get("price") ?? "0").replace(/[^0-9.]/g, "");
  const isFree = form.get("is_free") === "on";
  const parsed = TemplateInput.safeParse({
    name,
    slug: String(form.get("slug") ?? "").trim() || slugify(name),
    kind: form.get("kind") === "bundle" ? "bundle" : "template",
    tagline: form.get("tagline") ?? "",
    description: form.get("description") ?? "",
    category_id: String(form.get("category_id") ?? "") || null,
    price_cents: isFree ? 0 : Math.round(Number(priceText || 0) * 100),
    is_free: isFree,
    is_published: form.get("is_published") === "on",
    is_featured: form.get("is_featured") === "on",
    preview_url: String(form.get("preview_url") ?? "").trim() || null,
    accent_color: String(form.get("accent_color") ?? "#17171B"),
    accent_ink: String(form.get("accent_ink") ?? "#FFFFFF"),
    display_font: String(form.get("display_font") ?? "").trim() || null,
    version: String(form.get("version") ?? "1.0.0"),
    dodo_product_id: String(form.get("dodo_product_id") ?? "").trim() || null,
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] ??= i.message;
    return { error: "Some fields need attention.", fieldErrors: fe };
  }

  const row = {
    ...parsed.data,
    tags: commas(form.get("tags")),
    features: lines(form.get("features")),
    included: lines(form.get("included")),
    tech_stack: lines(form.get("tech_stack")),
    pages: String(form.get("pages") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    cover_path: String(form.get("cover_path") ?? "") || null,
    gallery_paths: lines(form.get("gallery_paths")),
  };

  // Uses your admin login, so database security rules double-check you're an admin.
  const supabase = await createClient();
  const result = id
    ? await supabase.from("templates").update(row).eq("id", id).select("id, slug").single()
    : await supabase.from("templates").insert(row).select("id, slug").single();
  if (result.error) {
    if (result.error.code === "23505") return { error: "Another template already uses that URL name (slug).", fieldErrors: { slug: "Already taken." } };
    console.error("saveTemplate", result.error);
    return { error: "The template couldn't be saved. Please try again." };
  }

  let warning: string | undefined;
  if (!row.is_free && process.env.DODO_PAYMENTS_API_KEY) {
    try {
      const productId = await syncDodoProduct({ name: row.name, tagline: row.tagline, price_cents: row.price_cents, dodo_product_id: row.dodo_product_id });
      if (productId !== row.dodo_product_id) await supabase.from("templates").update({ dodo_product_id: productId }).eq("id", result.data.id);
    } catch (e) {
      console.error("Dodo sync failed", e);
      warning = "Saved, but the price couldn't be synced to Dodo Payments. Check your Dodo keys, then save again.";
    }
  } else if (!row.is_free) {
    warning = "Saved. Add your Dodo Payments keys so this template can be bought.";
  }

  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/templates/${result.data.id}?created=1`);
  return { success: "Template saved.", warning };
}

/** Delete a template that has never been sold. */
export async function deleteTemplate(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (String(form.get("confirm") ?? "").trim() !== "DELETE") return { error: "Type DELETE to confirm." };
  const db = createAdminClient();
  const { count } = await db.from("orders").select("id", { count: "exact", head: true }).eq("template_id", id);
  if (count) return { error: "This template has orders, so it can't be deleted (your sales records need it). Unpublish it instead." };

  const { data: tpl } = await db.from("templates").select("cover_path, gallery_paths").eq("id", id).single();
  const { data: file } = await db.from("template_files").select("file_path").eq("template_id", id).maybeSingle();
  const images = [tpl?.cover_path, ...(tpl?.gallery_paths ?? [])].filter((p): p is string => !!p && !p.startsWith("/") && !p.startsWith("http"));
  if (images.length) await db.storage.from("previews").remove(images);
  if (file) await db.storage.from("template-files").remove([file.file_path]);

  const supabase = await createClient();
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) return { error: "The template couldn't be deleted." };
  revalidatePath("/", "layout");
  redirect("/admin/templates?deleted=1");
}

/** Called after the browser uploads a new downloadable file. */
export async function setTemplateFile(templateId: string, path: string, fileName: string, size: number): Promise<AdminState> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(templateId) || !path.startsWith(`${templateId}/`)) return { error: "Invalid upload." };
  const supabase = await createClient();
  const { data: old } = await supabase.from("template_files").select("file_path").eq("template_id", templateId).maybeSingle();
  const { error } = await supabase
    .from("template_files")
    .upsert({ template_id: templateId, file_path: path, file_name: fileName.slice(0, 120), file_size_bytes: size, updated_at: new Date().toISOString() });
  if (error) return { error: "The file uploaded, but couldn't be attached. Try again." };
  if (old && old.file_path !== path) await createAdminClient().storage.from("template-files").remove([old.file_path]);
  revalidatePath(`/admin/templates/${templateId}`);
  return { success: "File attached. Customers will download this version from now on." };
}

// ───────────────────────── Categories ─────────────────────────
export async function saveCategory(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "") || null;
  const name = String(form.get("name") ?? "").trim();
  const parsed = z
    .object({
      name: z.string().min(2, "Name needs 2+ characters.").max(40),
      slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
      description: z.string().trim().max(200),
      sort_order: z.number().int().min(0).max(999),
    })
    .safeParse({
      name,
      slug: String(form.get("slug") ?? "").trim() || slugify(name),
      description: form.get("description") ?? "",
      sort_order: Number(form.get("sort_order") ?? 0) || 0,
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("categories").update(parsed.data).eq("id", id) : await supabase.from("categories").insert(parsed.data);
  if (error) return { error: error.code === "23505" ? "That URL name is already used by another category." : "The category couldn't be saved." };
  revalidatePath("/", "layout");
  return { success: id ? "Category saved." : "Category added." };
}

export async function deleteCategory(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", String(form.get("id") ?? ""));
  if (error) return { error: "The category couldn't be deleted." };
  revalidatePath("/", "layout");
  return { success: "Category deleted. Its templates are now uncategorised." };
}
