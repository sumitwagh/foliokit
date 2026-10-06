"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/images";

const MAX = 10 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"];

/** Uploads images straight from your browser to the public "previews" bucket. */
export function ImageUploader({ name, folder, initial, multiple = false, label, hint }: { name: string; folder: string; initial: string[]; multiple?: boolean; label: string; hint: string }) {
  const [paths, setPaths] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!TYPES.includes(file.type)) {
        setError(`${file.name}: use PNG, JPG, WebP, AVIF or GIF.`);
        continue;
      }
      if (file.size > MAX) {
        setError(`${file.name} is larger than 10 MB. Export a smaller image.`);
        continue;
      }
      const clean = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `${folder || "uploads"}/${Date.now()}-${clean}`;
      const { error: upErr } = await supabase.storage.from("previews").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (upErr) setError(`${file.name} couldn't be uploaded: ${upErr.message}`);
      else added.push(path);
    }
    setPaths((p) => (multiple ? [...p, ...added] : added.length ? [added[0]] : p));
    setBusy(false);
  }

  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={paths.join("\n")} />
      <div className="flex flex-wrap gap-3">
        {paths.map((p, i) => (
          <div key={p} className="group relative h-24 w-36 overflow-hidden rounded-xl border border-line bg-paper">
            <img src={imageUrl(p) ?? ""} alt="" className="h-full w-full object-cover object-top" />
            <button
              type="button"
              onClick={() => setPaths((list) => list.filter((_, j) => j !== i))}
              className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white"
              aria-label={`Remove image ${i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        {(multiple || paths.length === 0) && (
          <label className="grid h-24 w-36 cursor-pointer place-items-center rounded-xl border border-dashed border-line-2 text-center text-sm text-ink-2 hover:border-ink">
            {busy ? "Uploading…" : multiple ? "Add images" : "Upload image"}
            <input type="file" accept={TYPES.join(",")} multiple={multiple} className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={busy} />
          </label>
        )}
        {!multiple && paths.length > 0 && (
          <label className="grid h-24 w-36 cursor-pointer place-items-center rounded-xl border border-dashed border-line-2 text-sm text-ink-2 hover:border-ink">
            {busy ? "Uploading…" : "Replace"}
            <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={busy} />
          </label>
        )}
      </div>
      <p className="hint">{hint}</p>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
