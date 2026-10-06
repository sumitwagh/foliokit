import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";
import { claimOrdersByEmail } from "@/lib/access";

/**
 * Handles the links in Supabase emails (confirm sign-up, reset password).
 * Supports both link styles: ?token_hash=…&type=… and ?code=…
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const remembered = request.cookies.get("fk_next")?.value;
  let next = safeNext(url.searchParams.get("next") ?? remembered, "/account");
  if (type === "recovery") next = "/reset-password";
  else if (remembered && next === "/account") next = safeNext(remembered, "/account");

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=link-expired", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await claimOrdersByEmail(user.id, user.email);

  const response = NextResponse.redirect(new URL(next, url.origin));
  response.cookies.delete("fk_next");
  return response;
}
