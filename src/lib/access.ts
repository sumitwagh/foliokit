import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Can this user download this template? (free, purchased, covered by a pass, or admin) */
export async function userHasAccess(userId: string, templateId: string) {
  const db = createAdminClient();
  const [{ data: allowed, error }, { data: profile }] = await Promise.all([
    db.rpc("has_access", { p_user: userId, p_template: templateId }),
    db.from("profiles").select("role").eq("id", userId).maybeSingle(),
  ]);
  if (error) throw error;
  return Boolean(allowed) || profile?.role === "admin";
}

/**
 * Links paid orders that were made with this (verified) email but no account,
 * e.g. if someone bought through a Dodo link, to the account.
 */
export async function claimOrdersByEmail(userId: string, email: string | undefined | null) {
  if (!email) return;
  const db = createAdminClient();
  await db.from("orders").update({ user_id: userId }).is("user_id", null).ilike("customer_email", email).eq("status", "paid");
}
