import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { FileUploader } from "@/components/admin/FileUploader";
import { DeleteTemplate } from "@/components/admin/DeleteTemplate";
import type { Category, Template } from "@/lib/types";

export default async function EditTemplate({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = createAdminClient();
  const [{ data: t }, { data: cats }, { data: file }] = await Promise.all([
    db.from("templates").select("*").eq("id", id).maybeSingle(),
    db.from("categories").select("*").order("sort_order"),
    db.from("template_files").select("file_name, file_size_bytes, updated_at").eq("template_id", id).maybeSingle(),
  ]);
  if (!t) notFound();

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/templates" className="text-sm text-muted hover:text-ink">
          Templates
        </Link>
        <h1 className="mt-1 text-[34px] font-semibold tracking-[-0.03em]">{t.name}</h1>
      </div>
      {t.kind === "template" && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Downloadable file</h2>
          <div className="mt-4">
            <FileUploader templateId={t.id} current={file} />
          </div>
        </section>
      )}
      <TemplateForm template={t as Template} categories={(cats ?? []) as Category[]} created={Boolean(sp.created)} />
      <section className="card border-danger/30 p-6">
        <h2 className="text-lg font-semibold text-danger">Delete template</h2>
        <div className="mt-3">
          <DeleteTemplate id={t.id} name={t.name} />
        </div>
      </section>
    </div>
  );
}
