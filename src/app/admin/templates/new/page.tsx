import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { TemplateForm } from "@/components/admin/TemplateForm";
import type { Category } from "@/lib/types";

export default async function NewTemplate() {
  const { data } = await createAdminClient().from("categories").select("*").order("sort_order");
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/templates" className="text-sm text-muted hover:text-ink">
          Templates
        </Link>
        <h1 className="mt-1 text-[34px] font-semibold tracking-[-0.03em]">Add a template</h1>
        <p className="mt-1 text-ink-2">Fill in the details and save. You&apos;ll upload the downloadable file on the next screen.</p>
      </div>
      <TemplateForm template={null} categories={(data ?? []) as Category[]} />
    </div>
  );
}
