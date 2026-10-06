import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on pages, skip static files, images, previews and the payment webhook.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|covers/|previews/|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|html|txt|xml)$).*)",
  ],
};
