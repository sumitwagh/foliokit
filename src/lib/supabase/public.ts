import "server-only";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Cookie-free, read-only client for public catalog data.
 * Because it doesn't read cookies, catalog pages can be cached and served fast.
 */
export function createPublicClient() {
  return createSupabase(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
