"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/account", label: "Library" },
  { href: "/account/orders", label: "Order history" },
  { href: "/account/profile", label: "Profile & password" },
];

export function AccountTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Account" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-[15px] font-semibold transition-colors ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
