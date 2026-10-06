import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export function AuthShell({ title, intro, children, footer }: { title: string; intro?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container-x grid min-h-[calc(100dvh-68px)] place-items-center py-12">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-8 inline-block" aria-label="Home">
          <LogoMark className="h-10 w-10" />
        </Link>
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
        {intro && <div className="mt-2 text-[16px] leading-relaxed text-ink-2">{intro}</div>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t border-line pt-6 text-[15px] text-ink-2">{footer}</div>}
      </div>
    </div>
  );
}
