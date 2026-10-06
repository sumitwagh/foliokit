import { publicEnv } from "@/lib/env";

/**
 * Turns a stored image path into a URL.
 * - "/covers/x.webp"  → served from the /public folder of this site
 * - "https://…"       → used as-is
 * - "ledger/cover.webp" → a file in the public Supabase "previews" bucket
 */
export function imageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/previews/${path}`;
}

/** Google Fonts stylesheet for template names, limited to the letters actually used. */
export function specimenFontsHref(items: { display_font: string | null; name: string }[]) {
  const fonts = [...new Set(items.map((i) => i.display_font).filter(Boolean))] as string[];
  if (!fonts.length) return null;
  const letters = [...new Set(items.map((i) => i.name).join("") + "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789$&")]
    .join("");
  const families = fonts.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&text=${encodeURIComponent(letters)}&display=swap`;
}
