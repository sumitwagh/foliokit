"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Access = { signedIn: boolean; owned: boolean };

export function BuyBox({
  slug,
  name,
  priceCents,
  currency,
  isFree,
  isBundle,
}: {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  isFree: boolean;
  isBundle: boolean;
}) {
  const [access, setAccess] = useState<Access | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = `/templates/${slug}`;

  useEffect(() => {
    let active = true;
    fetch(`/api/access/${slug}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { signedIn: false, owned: false }))
      .then((a) => active && setAccess(a))
      .catch(() => active && setAccess({ signedIn: false, owned: false }));
    return () => {
      active = false;
    };
  }, [slug]);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(next)}&reason=buy`;
        return;
      }
      if (data.alreadyOwned) {
        setAccess({ signedIn: true, owned: true });
        setBusy(false);
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout could not start. Please try again.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout could not start. Please try again.");
      setBusy(false);
    }
  }

  const priceLabel = isFree ? "Free" : formatPrice(priceCents, currency);

  return (
    <div className="grid gap-3">
      <p className="flex items-baseline gap-2">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{priceLabel}</span>
        <span className="text-muted">{isFree ? "with a free account" : "one-time payment"}</span>
      </p>

      {!access ? (
        <div className="h-12 animate-pulse rounded-full bg-line" aria-label="Checking your library" />
      ) : access.owned && !isBundle ? (
        <>
          <a href={`/api/download/${slug}`} className="btn btn-primary h-12 text-base">
            Download {name}
          </a>
          <p className="text-sm text-ok">{isFree ? "Free for your account." : "You own this template."} It&apos;s also in your <Link href="/account" className="underline underline-offset-4">library</Link>.</p>
        </>
      ) : access.owned && isBundle ? (
        <>
          <Link href="/account" className="btn btn-primary h-12 text-base">
            Go to my library
          </Link>
          <p className="text-sm text-ok">Your All-Access Pass is active. Every template is in your library.</p>
        </>
      ) : isFree ? (
        <>
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="btn btn-primary h-12 text-base">
            Create a free account to download
          </Link>
          <p className="text-sm text-muted">
            Already have one? <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">Log in</Link>
          </p>
        </>
      ) : (
        <>
          <button type="button" onClick={buy} disabled={busy} className="btn btn-primary h-12 text-base">
            {busy ? "Opening secure checkout…" : `Buy ${name} for ${priceLabel}`}
          </button>
          {!access.signedIn && <p className="text-sm text-muted">You&apos;ll log in or create an account first, so your purchase is saved to your library.</p>}
        </>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
