"use client";

import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/app/(auth)/actions";
import { Field, FormAlert, SubmitButton } from "@/components/auth/Field";

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});
  if (state.success) return <FormAlert tone="success">{state.success}</FormAlert>;
  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <SubmitButton pending={pending} pendingText="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
