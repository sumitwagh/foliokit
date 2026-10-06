/**
 * Reads environment variables in one place.
 * Public values (NEXT_PUBLIC_*) are safe in the browser.
 * Everything else must only be used on the server.
 */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

/** Lists missing settings so the setup screen can tell you exactly what to add. */
export function missingEnv(): string[] {
  const required: [string, string | undefined][] = [
    ["NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL],
    ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
    ["DODO_PAYMENTS_API_KEY", process.env.DODO_PAYMENTS_API_KEY],
    ["DODO_PAYMENTS_WEBHOOK_KEY", process.env.DODO_PAYMENTS_WEBHOOK_KEY],
    ["DODO_PAYMENTS_ENVIRONMENT", process.env.DODO_PAYMENTS_ENVIRONMENT],
  ];
  return required.filter(([, v]) => !v).map(([k]) => k);
}
