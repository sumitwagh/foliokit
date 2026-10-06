import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { userHasAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

/** Tells the product page whether the visitor is signed in and owns this template. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ signedIn: false, owned: false });

  const { data: tpl } = await createAdminClient().from("templates").select("id, kind").eq("slug", slug).maybeSingle();
  if (!tpl) return NextResponse.json({ signedIn: true, owned: false });

  if (tpl.kind === "bundle") {
    const { data } = await createAdminClient()
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("template_id", tpl.id)
      .eq("status", "paid")
      .limit(1);
    return NextResponse.json({ signedIn: true, owned: Boolean(data?.length) });
  }
  return NextResponse.json({ signedIn: true, owned: await userHasAccess(user.id, tpl.id) });
}
