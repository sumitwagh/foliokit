"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <p className="mb-3 hidden text-sm font-semibold text-muted lg:block">Admin</p>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-colors ${active ? "bg-ink text-white" : "text-ink-2 hover:bg-surface"}`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
