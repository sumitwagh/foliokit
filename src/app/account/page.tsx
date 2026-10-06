import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimOrdersByEmail } from "@/lib/access";
import { formatDate } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { FormAlert } from "@/components/auth/Field";
import type { Template } from "@/lib/types";

export const metadata: Metadata = { title: "My library", robots: { index: false } };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, { tone: "success" | "error"; text: string }> = {
  "password-updated": { tone: "success", text: "Your new password is saved." },
  "file-missing": { tone: "error", text: "That template's file isn't available right now. We've been notified; please try again later or email us." },
  "download-failed": { tone: "error", text: "The download couldn't start. Please try again in a moment." },
};

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await claimOrdersByEmail(user!.id, user!.email);

  const { data: orders } = await supabase
    .from("orders")
    .select("template_id, paid_at, template:templates(kind)")
    .eq("status", "paid")
    .order("paid_at", { ascending: false });
  const paid = (orders ?? []) as unknown as { template_id: string; paid_at: string; template: { kind: string } | null }[];
  const hasPass = paid.some((o) => o.template?.kind === "bundle");

  const db = createAdminClient();
  const { data: all } = await db
    .from("templates")
    .select("id, slug, name, tagline, kind, is_free, is_published, preview_url, cover_path, accent_color, version, updated_at")
    .eq("kind", "template")
    .order("created_at");
  const purchasedAt = new Map(paid.map((o) => [o.template_id, o.paid_at]));
  const owned = ((all ?? []) as Template[]).filter((t) => hasPass || purchasedAt.has(t.id) || (t.is_free && t.is_published));
  const notice = NOTICES[sp.notice ?? sp.error ?? ""];

  return (
    <div className="grid gap-8">
      {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}
      {hasPass && <FormAlert tone="success">Your All-Access Pass is active. Every template, including future ones, is yours.</FormAlert>}

      {owned.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-line-2 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">Your library is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-2">Templates you buy or download for free appear here, ready to download again any time.</p>
          <Link href="/templates" className="btn btn-primary mt-6">
            Browse templates
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {owned.map((t) => {
            const bought = purchasedAt.get(t.id);
            const cover = imageUrl(t.cover_path);
            return (
              <li key={t.id} className="card flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
                <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:w-48" style={{ background: t.accent_color }}>
                  {cover && <img src={cover} alt="" className="h-full w-full object-cover object-top" loading="lazy" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    <Link href={`/templates/${t.slug}`} className="hover:text-plum">
                      {t.name}
                    </Link>
                  </h2>
                  <p className="mt-0.5 text-[15px] text-ink-2">{t.tagline}</p>
                  <p className="mt-1.5 text-sm text-muted">
                    Version {t.version}
                    {bought ? `, bought ${formatDate(bought)}` : hasPass ? ", included in your pass" : ", free template"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {t.preview_url && (
                    <a href={t.preview_url} target="_blank" rel="noopener" className="btn btn-secondary">
                      Preview
                    </a>
                  )}
                  <a href={`/api/download/${t.slug}`} className="btn btn-primary">
                    Download
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
