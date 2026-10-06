"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { UserMenu, useAccount } from "@/components/UserMenu";

const NAV = [
  { href: "/templates", label: "Templates" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#free", label: "Free template" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={`sticky top-[env(safe-area-inset-top,0px)] z-40 border-b bg-paper/85 backdrop-blur-md transition-colors ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = n.href === "/templates" && pathname.startsWith("/templates");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors hover:bg-surface hover:text-ink ${
                    active ? "bg-surface text-ink" : "text-ink-2"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden md:block">
          <UserMenu />
        </div>
        <button
          type="button"
          className="btn btn-secondary md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && <MobileNav />}
    </header>
  );
}

function MobileNav() {
  const account = useAccount();
  return (
    <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-[68px] z-40 overflow-y-auto bg-paper px-4 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-4 md:hidden">
      <nav aria-label="Mobile" className="grid gap-1">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="rounded-2xl px-4 py-4 text-2xl font-semibold tracking-tight hover:bg-surface">
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 grid gap-2 border-t border-line pt-6">
        {account.status === "in" ? (
          <>
            <Link href="/account" className="btn btn-primary">
              My library
            </Link>
            <Link href="/account/orders" className="btn btn-secondary">
              Order history
            </Link>
            {account.isAdmin && (
              <Link href="/admin" className="btn btn-secondary">
                Admin dashboard
              </Link>
            )}
            <form action="/auth/signout" method="post" className="grid">
              <button className="btn btn-ghost" type="submit">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/signup" className="btn btn-primary">
              Create a free account
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
