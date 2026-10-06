"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type State = { status: "loading" } | { status: "out" } | { status: "in"; email: string; name: string | null; isAdmin: boolean };

export function useAccount() {
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) return setState({ status: "out" });
      const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
      if (active) setState({ status: "in", email: user.email ?? "", name: data?.full_name ?? null, isAdmin: data?.role === "admin" });
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}

export function UserMenu() {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (account.status === "loading") return <div className="h-11 w-36" aria-hidden="true" />;

  if (account.status === "out") {
    return (
      <div className="flex items-center gap-1">
        <Link href="/login" className="btn btn-ghost">
          Log in
        </Link>
        <Link href="/signup" className="btn btn-primary">
          Sign up
        </Link>
      </div>
    );
  }

  const initial = (account.name || account.email).trim().charAt(0).toUpperCase();
  return (
    <div className="relative flex items-center gap-1" ref={ref}>
      <Link href="/account" className="btn btn-ghost hidden sm:inline-flex">
        My library
      </Link>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="grid h-11 w-11 place-items-center rounded-full bg-plum text-[15px] font-semibold text-white transition hover:bg-plum-2"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-[0_18px_40px_-18px_rgba(23,23,27,.35)]">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{account.name || "Your account"}</p>
            <p className="truncate text-[13px] text-muted">{account.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          {[
            ["/account", "My library"],
            ["/account/orders", "Order history"],
            ["/account/profile", "Profile & password"],
            ...(account.isAdmin ? [["/admin", "Admin dashboard"]] : []),
          ].map(([href, label]) => (
            <Link key={href} href={href} role="menuitem" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-[15px] hover:bg-paper">
              {label}
            </Link>
          ))}
          <div className="my-1 h-px bg-line" />
          <form action="/auth/signout" method="post">
            <button type="submit" role="menuitem" className="block w-full rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-paper">
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
