"use client";

import { useActionState } from "react";
import { deleteCategory, saveCategory, type AdminState } from "@/app/admin/actions";

export function CategoryRow({ c, count }: { c?: { id: string; name: string; slug: string; description: string; sort_order: number }; count?: number }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveCategory, {});
  const [delState, del, deleting] = useActionState<AdminState, FormData>(deleteCategory, {});
  const isNew = !c;
  return (
    <div className="card p-5">
      <form action={action} className="grid gap-3 md:grid-cols-[1.2fr_1fr_2fr_90px_auto] md:items-end" key={isNew ? state.success : undefined}>
        {c && <input type="hidden" name="id" value={c.id} />}
        <label className="field">
          <span className="label">Name</span>
          <input name="name" defaultValue={c?.name} className="input" required />
        </label>
        <label className="field">
          <span className="label">URL name</span>
          <input name="slug" defaultValue={c?.slug} className="input" placeholder="auto" />
        </label>
        <label className="field">
          <span className="label">Description</span>
          <input name="description" defaultValue={c?.description} className="input" />
        </label>
        <label className="field">
          <span className="label">Order</span>
          <input name="sort_order" type="number" min={0} defaultValue={c?.sort_order ?? 0} className="input" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : isNew ? "Add" : "Save"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className={state.error ? "text-danger" : state.success ? "text-ok" : "text-muted"}>
          {state.error ?? state.success ?? delState.error ?? (count !== undefined ? `${count} ${count === 1 ? "template" : "templates"}` : "New category")}
        </span>
        {c && (
          <form action={del}>
            <input type="hidden" name="id" value={c.id} />
            <button type="submit" disabled={deleting} className="text-danger underline underline-offset-4">
              {deleting ? "Deleting…" : "Delete category"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
