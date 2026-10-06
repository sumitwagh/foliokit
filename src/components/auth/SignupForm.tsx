"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resendConfirmation, signup, type FormState } from "@/app/(auth)/actions";
import { Field, FormAlert, SubmitButton } from "@/components/auth/Field";

export function SignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, {});
  const [resent, resend, resending] = useActionState<FormState, FormData>(resendConfirmation, {});

  if (state.success === "sent") {
    return (
      <div className="grid gap-5">
        <FormAlert tone="success">
          Check your inbox. We sent a confirmation link to <strong>{state.email}</strong>. Click it to finish creating your account.
        </FormAlert>
        <p className="text-[15px] text-ink-2">Nothing after a few minutes? Check your spam folder, or send it again.</p>
        <form action={resend}>
          <input type="hidden" name="email" value={state.email} />
          {resent.success ? (
            <FormAlert tone="info">{resent.success}</FormAlert>
          ) : (
            <button type="submit" disabled={resending} className="btn btn-secondary w-full">
              {resending ? "Sending…" : "Send the link again"}
            </button>
          )}
          {resent.error && <p className="error-text mt-2">{resent.error}</p>}
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <input type="hidden" name="next" value={next} />
      <Field label="Your name" name="full_name" autoComplete="name" defaultValue={state.values?.full_name} error={state.fieldErrors?.full_name} />
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <Field label="Password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters." error={state.fieldErrors?.password} />
      <div className="grid gap-3 text-[15px]">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-[var(--color-plum)]" />
          <span className="text-ink-2">
            I agree to the <Link href="/terms" className="underline underline-offset-4">terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-4">privacy policy</Link>.
          </span>
        </label>
        {state.fieldErrors?.terms && <p className="error-text -mt-1">{state.fieldErrors.terms}</p>}
        <label className="flex items-start gap-3">
          <input type="checkbox" name="marketing" className="mt-1 h-4 w-4 accent-[var(--color-plum)]" />
          <span className="text-ink-2">Email me when new templates come out (about once a month).</span>
        </label>
      </div>
      <SubmitButton pending={pending} pendingText="Creating your account…">
        Create account
      </SubmitButton>
    </form>
  );
}
