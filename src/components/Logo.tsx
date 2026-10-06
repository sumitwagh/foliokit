import Link from "next/link";
import { site } from "@/config/site";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="5" y="7" width="15" height="19" rx="3" fill="#4A2360" transform="rotate(-9 12 16)" />
      <rect x="11" y="5" width="15" height="19" rx="3" fill="#17171B" />
      <rect x="14.5" y="9" width="8" height="2" rx="1" fill="#F4F4F1" />
      <rect x="14.5" y="13" width="5.5" height="2" rx="1" fill="#A9A9B0" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2 rounded-lg font-semibold tracking-tight text-ink" aria-label={`${site.name} home`}>
      <span className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6">
        <LogoMark />
      </span>
      <span className="text-[19px]">{site.name}</span>
    </Link>
  );
}
