import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage() {
  await requireUser("/reset-password");
  return (
    <AuthShell title="Choose a new password" intro="You're signed in from your reset link. Pick a new password for next time.">
      <NewPasswordForm />
    </AuthShell>
  );
}
