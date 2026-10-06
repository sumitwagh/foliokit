"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { setTemplateFile } from "@/app/admin/actions";
import { formatBytes } from "@/lib/format";
import { FormAlert } from "@/components/auth/Field";

const MAX = 50 * 1024 * 1024;

/** Uploads the downloadable .zip to the PRIVATE "template-files" bucket. */
export function FileUploader({ templateId, current }: { templateId: string; current: { file_name: string; file_size_bytes: number | null; updated_at: string } | null }) {
  const [file, setFile] = useState(current);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function upload(f: File | undefined) {
    if (!f) return;
    setMsg(null);
    if (f.size > MAX) return setMsg({ tone: "error", text: "Files must be 50 MB or smaller on the free Supabase plan." });
    setBusy(true);
    const clean = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${templateId}/${Date.now()}-${clean}`;
    const { error } = await createClient().storage.from("template-files").upload(path, f, { contentType: f.type || "application/zip" });
    if (error) {
      setBusy(false);
      return setMsg({ tone: "error", text: `Upload failed: ${error.message}` });
    }
    const res = await setTemplateFile(templateId, path, f.name, f.size);
    setBusy(false);
    if (res.error) return setMsg({ tone: "error", text: res.error });
    setFile({ file_name: f.name, file_size_bytes: f.size, updated_at: new Date().toISOString() });
    setMsg({ tone: "success", text: res.success! });
  }

  return (
    <div className="grid gap-4">
      {file ? (
        <div className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3 text-[15px]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-xs font-bold text-white">ZIP</span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{file.file_name}</span>
            <span className="text-muted">{formatBytes(file.file_size_bytes)}</span>
          </span>
        </div>
      ) : (
        <p className="rounded-xl bg-warn-bg px-4 py-3 text-[15px] text-warn">No file yet. Customers can&apos;t download this template until you upload one.</p>
      )}
      <label className="btn btn-secondary w-fit cursor-pointer">
        {busy ? "Uploading…" : file ? "Replace file" : "Upload .zip file"}
        <input type="file" accept=".zip,application/zip" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      {msg && <FormAlert tone={msg.tone}>{msg.text}</FormAlert>}
      <p className="hint">Stored privately. Buyers get a download link that expires after 60 seconds.</p>
    </div>
  );
}
