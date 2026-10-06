import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { PasswordForm, ProfileForm } from "@/components/account/ProfileForms";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
        <div className="mt-6">
          <ProfileForm name={profile?.full_name ?? ""} email={profile?.email ?? ""} marketing={profile?.marketing_opt_in ?? false} />
        </div>
      </section>
      <section className="card p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Password</h2>
        <div className="mt-6">
          <PasswordForm />
        </div>
        <form action="/auth/signout" method="post" className="mt-8 border-t border-line pt-6">
          <button type="submit" className="btn btn-secondary">
            Log out of this device
          </button>
        </form>
      </section>
    </div>
  );
}
