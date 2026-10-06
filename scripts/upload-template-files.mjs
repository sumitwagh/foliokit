/**
 * One-time helper: uploads the five starter template .zip files from
 * /product-files to your PRIVATE Supabase bucket and attaches each one to its
 * template. Run it after schema.sql and seed.sql:
 *
 *   npm run upload-files
 *
 * (You can also upload files one by one in /admin → Templates.)
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const dir = path.resolve("product-files");
const files = (await readdir(dir)).filter((f) => f.endsWith(".zip"));
let failed = 0;

for (const file of files) {
  const slug = file.replace(/\.zip$/, "");
  const { data: tpl } = await db.from("templates").select("id, name").eq("slug", slug).maybeSingle();
  if (!tpl) {
    console.log(`- skipped ${file}: no template with slug "${slug}"`);
    continue;
  }
  const body = await readFile(path.join(dir, file));
  const storagePath = `${tpl.id}/${slug}-v1.zip`;
  const { error: upErr } = await db.storage.from("template-files").upload(storagePath, body, { contentType: "application/zip", upsert: true });
  if (upErr) {
    failed++;
    console.log(`✗ ${tpl.name}: upload failed (${upErr.message})`);
    continue;
  }
  const { error } = await db
    .from("template_files")
    .upsert({ template_id: tpl.id, file_path: storagePath, file_name: `${slug}.zip`, file_size_bytes: body.length, updated_at: new Date().toISOString() });
  if (error) {
    failed++;
    console.log(`✗ ${tpl.name}: ${error.message}`);
  } else console.log(`✓ ${tpl.name} (${Math.round(body.length / 1024)} KB)`);
}
process.exit(failed ? 1 : 0);
