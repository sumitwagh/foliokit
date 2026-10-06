import { AccountTabs } from "@/components/account/AccountTabs";
import { requireUser } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <div className="container-x pb-10 pt-10 md:pt-14">
      <p className="text-[15px] text-muted">{user.email}</p>
      <h1 className="mt-1 text-[clamp(32px,4vw,48px)] font-semibold leading-tight tracking-[-0.035em]">Your account</h1>
      <AccountTabs />
      <div className="mt-8">{children}</div>
    </div>
  );
}
