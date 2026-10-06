"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { safeNext } from "@/lib/auth";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  email?: string;
  values?: Record<string, string>;
};

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address, like you@example.com.").max(254));
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

const NEXT_COOKIE = "fk_next";

// ───────────────────────── Log in ─────────────────────────
export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1, "Enter your password.") }).safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  const values = { email: String(form.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox for the link we sent.", email: parsed.data.email, values };
    }
    if (error.status === 429) return { error: "Too many attempts. Wait a minute and try again.", values };
    return { error: "That email and password don't match an account.", values };
  }
  redirect(safeNext(form.get("next")));
}

// ───────────────────────── Sign up ─────────────────────────
export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({
      full_name: z.string().trim().min(1, "Enter your name.").max(80, "Use 80 characters or fewer."),
      email,
      password,
      terms: z.literal("on", { error: "Please accept the terms to continue." }),
    })
    .safeParse({
      full_name: form.get("full_name"),
      email: form.get("email"),
      password: form.get("password"),
      terms: form.get("terms") ?? undefined,
    });
  const values = { full_name: String(form.get("full_name") ?? ""), email: String(form.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const next = safeNext(form.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
      data: { full_name: parsed.data.full_name, marketing_opt_in: form.get("marketing") === "on" },
    },
  });
  if (error) {
    if (error.code === "weak_password") return { fieldErrors: { password: error.message }, values };
    if (error.status === 429) return { error: "Too many sign-ups from here. Wait a few minutes and try again.", values };
    return { error: "We couldn't create your account. Please try again.", values };
  }

  // If email confirmation is switched off in Supabase, the user is signed in already.
  if (data.session) redirect(next);

  // Remember where to send them after they click the email link.
  (await cookies()).set(NEXT_COOKIE, next, { httpOnly: true, sameSite: "lax", secure: publicEnv.siteUrl.startsWith("https"), maxAge: 60 * 60 * 24, path: "/" });
  return { success: "sent", email: parsed.data.email };
}

export async function resendConfirmation(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/account` },
  });
  if (error?.status === 429) return { error: "Please wait a minute before asking for another email.", email: parsed.data };
  return { success: "We sent a new confirmation link. It can take a minute to arrive.", email: parsed.data };
}

// ───────────────────────── Password reset ─────────────────────────
export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message }, values: { email: String(form.get("email") ?? "") } };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/reset-password`,
  });
  if (error?.status === 429) return { error: "Please wait a minute before asking for another link.", values: { email: parsed.data } };
  // Same message whether or not the account exists, so nobody can check who has an account.
  return { success: `If ${parsed.data} has an account, a reset link is on its way. It works for one hour.` };
}

export async function updatePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ password, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords don't match." })
    .safeParse({ password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Choose a password you haven't used here before." } };
    if (error.code === "weak_password") return { fieldErrors: { password: error.message } };
    return { error: "Your reset link has expired. Request a new one and try again." };
  }
  redirect("/account?notice=password-updated");
}
