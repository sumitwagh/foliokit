"use client";

import { useActionState } from "react";
import { deleteTemplate, type AdminState } from "@/app/admin/actions";
import { FormAlert } from "@/components/auth/Field";

export function DeleteTemplate({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(deleteTemplate, {});
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-[15px] text-ink-2">
        Permanently deletes {name}, its images and file. Templates that have been sold can&apos;t be deleted; unpublish them instead.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="field w-48">
          <span className="label">Type DELETE to confirm</span>
          <input name="confirm" className="input" autoComplete="off" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-danger">
          {pending ? "Deleting…" : "Delete template"}
        </button>
      </div>
      {state.error && <FormAlert>{state.error}</FormAlert>}
    </form>
  );
}
