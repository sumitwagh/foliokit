import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { publicEnv, isSupabaseConfigured } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const pages = ["", "/templates", "/license", "/refunds", "/terms", "/privacy"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const }));
  if (!isSupabaseConfigured) return pages;
  const { data } = await createPublicClient().from("templates").select("slug, updated_at");
  return [...pages, ...(data ?? []).map((t) => ({ url: `${base}/templates/${t.slug}`, lastModified: t.updated_at }))];
}
