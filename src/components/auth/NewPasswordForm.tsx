"use client";

import { useActionState } from "react";
import { updatePassword, type FormState } from "@/app/(auth)/actions";
import { Field, FormAlert, SubmitButton } from "@/components/auth/Field";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, {});
  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Field label="New password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters." error={state.fieldErrors?.password} />
      <Field label="Repeat new password" name="confirm" type="password" autoComplete="new-password" error={state.fieldErrors?.confirm} />
      <SubmitButton pending={pending} pendingText="Saving…">
        Save new password
      </SubmitButton>
    </form>
  );
}
