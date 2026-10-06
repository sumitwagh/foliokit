"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "@/app/account/actions";
import type { FormState } from "@/app/(auth)/actions";
import { Field, FormAlert } from "@/components/auth/Field";

export function ProfileForm({ name, email, marketing }: { name: string; email: string; marketing: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.success && <FormAlert tone="success">{state.success}</FormAlert>}
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Field label="Name" name="full_name" defaultValue={name} autoComplete="name" error={state.fieldErrors?.full_name} />
      <div className="field">
        <span className="label">Email</span>
        <p className="input flex items-center bg-paper text-ink-2">{email}</p>
        <p className="hint">Need to change your email? Write to support and we&apos;ll move your purchases.</p>
      </div>
      <label className="flex items-start gap-3 text-[15px]">
        <input type="checkbox" name="marketing" defaultChecked={marketing} className="mt-1 h-4 w-4 accent-[var(--color-plum)]" />
        <span className="text-ink-2">Email me when new templates come out.</span>
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="grid gap-5" noValidate key={state.success}>
      {state.success && <FormAlert tone="success">{state.success}</FormAlert>}
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Field label="Current password" name="current" type="password" autoComplete="current-password" error={state.fieldErrors?.current} />
      <Field label="New password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters." error={state.fieldErrors?.password} />
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Changing…" : "Change password"}
        </button>
      </div>
    </form>
  );
}
