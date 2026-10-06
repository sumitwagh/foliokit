import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { userHasAccess } from "@/lib/access";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Secure download: checks the visitor may have the file, then redirects to a
 * private link that stops working after 60 seconds.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = publicEnv.siteUrl;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${base}/login?next=${encodeURIComponent(`/templates/${slug}`)}`, 303);

  const db = createAdminClient();
  const { data: tpl } = await db.from("templates").select("id, kind").eq("slug", slug).maybeSingle();
  if (!tpl || tpl.kind !== "template") return NextResponse.redirect(`${base}/templates`, 303);

  if (!(await userHasAccess(user.id, tpl.id))) {
    return NextResponse.redirect(`${base}/templates/${slug}?error=not-owned`, 303);
  }

  const { data: file } = await db.from("template_files").select("file_path, file_name").eq("template_id", tpl.id).maybeSingle();
  if (!file) return NextResponse.redirect(`${base}/account?error=file-missing&template=${slug}`, 303);

  const { data: signed, error } = await db.storage.from("template-files").createSignedUrl(file.file_path, 60, { download: file.file_name });
  if (error || !signed) {
    console.error("download: could not sign URL", error);
    return NextResponse.redirect(`${base}/account?error=download-failed&template=${slug}`, 303);
  }

  await db.rpc("record_download", { p_user: user.id, p_template: tpl.id });
  return NextResponse.redirect(signed.signedUrl, 303);
}
