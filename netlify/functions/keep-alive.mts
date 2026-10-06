/**
 * Runs once a day on Netlify (free). Supabase pauses free projects after a
 * week with no activity; this tiny daily request keeps your database awake
 * even during quiet weeks.
 */
export default async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Response("Supabase settings missing", { status: 500 });
  const res = await fetch(`${url}/rest/v1/categories?select=id&limit=1`, { headers: { apikey: key } });
  console.log("keep-alive: Supabase responded", res.status);
  return new Response("ok");
};

export const config = { schedule: "@daily" };
