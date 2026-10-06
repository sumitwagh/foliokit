"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, resendConfirmation, type FormState } from "@/app/(auth)/actions";
import { Field, FormAlert, SubmitButton } from "@/components/auth/Field";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  const [resent, resend, resending] = useActionState<FormState, FormData>(resendConfirmation, {});
  return (
    <div className="grid gap-5">
      {notice && !state.error && <FormAlert tone="info">{notice}</FormAlert>}
      {state.error && <FormAlert>{state.error}</FormAlert>}
      {state.email && (
        <form action={resend}>
          <input type="hidden" name="email" value={state.email} />
          {resent.success ? (
            <FormAlert tone="success">{resent.success}</FormAlert>
          ) : (
            <button type="submit" disabled={resending} className="btn btn-secondary w-full">
              {resending ? "Sending…" : "Send the confirmation email again"}
            </button>
          )}
        </form>
      )}
      <form action={action} className="grid gap-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.fieldErrors?.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          error={state.fieldErrors?.password}
          extra={
            <Link href="/forgot-password" className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
              Forgot password?
            </Link>
          }
        />
        <SubmitButton pending={pending} pendingText="Logging in…">
          Log in
        </SubmitButton>
      </form>
    </div>
  );
}
