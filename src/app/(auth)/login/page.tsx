import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

const NOTICES: Record<string, string> = {
  "link-expired": "That link has expired or was already used. Log in, or ask for a new link.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reason?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getUser()) redirect(next);
  const notice = sp.error ? NOTICES[sp.error] : sp.reason === "buy" ? "Log in or create a free account so your purchase is saved to your library." : undefined;
  return (
    <AuthShell
      title="Log in"
      intro="Welcome back. Your templates are waiting in your library."
      footer={
        <>
          New here?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-ink underline underline-offset-4">
            Create a free account
          </Link>
        </>
      }
    >
      <LoginForm next={next} notice={notice} />
    </AuthShell>
  );
}
