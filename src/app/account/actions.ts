"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/app/(auth)/actions";

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ full_name: z.string().trim().min(1, "Enter your name.").max(80, "Use 80 characters or fewer.") })
    .safeParse({ full_name: form.get("full_name") });
  if (!parsed.success) return { fieldErrors: { full_name: parsed.error.issues[0].message } };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Log in again." };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, marketing_opt_in: form.get("marketing") === "on" })
    .eq("id", user.id);
  if (error) return { error: "Your profile couldn't be saved. Try again." };
  revalidatePath("/account", "layout");
  return { success: "Profile saved." };
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({
      current: z.string().min(1, "Enter your current password."),
      password: z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer."),
    })
    .safeParse({ current: form.get("current"), password: form.get("password") });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] ??= i.message;
    return { fieldErrors: fe };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Your session ended. Log in again." };

  // Confirm it's really them before changing the password.
  const check = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.current });
  if (check.error) return { fieldErrors: { current: "That isn't your current password." } };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Choose a different password from your current one." } };
    return { error: "Your password couldn't be changed. Try again." };
  }
  return { success: "Password changed." };
}
