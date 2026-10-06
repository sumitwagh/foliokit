"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = { status: string; template?: { slug: string; name: string; kind: string } | null };

/** Waits for the payment to be confirmed (by webhook or a direct check with Dodo). */
export function PaymentStatus({ orderId, paymentId }: { orderId: string; paymentId?: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let stop = false;
    let tries = 0;
    async function poll() {
      tries++;
      try {
        const qs = paymentId ? `?payment_id=${encodeURIComponent(paymentId)}` : "";
        const res = await fetch(`/api/orders/${orderId}${qs}`, { cache: "no-store" });
        const data: Result = await res.json();
        if (stop) return;
        setResult(data);
        if (data.status === "pending" && tries < 30) setTimeout(poll, 2000);
        if (tries >= 30) setSlow(true);
      } catch {
        if (!stop && tries < 30) setTimeout(poll, 3000);
      }
    }
    poll();
    return () => {
      stop = true;
    };
  }, [orderId, paymentId]);

  const t = result?.template;
  if (!result || result.status === "pending") {
    return (
      <div className="grid justify-items-center gap-5 text-center">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-plum" aria-hidden="true" />
        <h1 className="text-[32px] font-semibold tracking-tight">Confirming your payment…</h1>
        <p className="max-w-md text-ink-2" role="status">
          {slow
            ? "This is taking longer than usual. You don't need to wait here: your template will appear in your library as soon as the payment clears, and you'll get an email receipt."
            : "This usually takes a few seconds. Please keep this page open."}
        </p>
        {slow && (
          <Link href="/account" className="btn btn-primary">
            Go to my library
          </Link>
        )}
      </div>
    );
  }

  if (result.status === "paid") {
    return (
      <div className="grid justify-items-center gap-5 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-ok" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="h-7 w-7">
            <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="text-[32px] font-semibold tracking-tight">Payment confirmed. {t?.name} is yours.</h1>
        <p className="max-w-md text-ink-2">A receipt is on its way to your email. You can download from your library any time.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {t && t.kind !== "bundle" && (
            <a href={`/api/download/${t.slug}`} className="btn btn-primary h-12 text-base">
              Download {t.name}
            </a>
          )}
          <Link href="/account" className="btn btn-secondary h-12 text-base">
            Go to my library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid justify-items-center gap-5 text-center">
      <h1 className="text-[32px] font-semibold tracking-tight">{result.status === "refunded" ? "This order was refunded" : "The payment didn't go through"}</h1>
      <p className="max-w-md text-ink-2">
        {result.status === "refunded" ? "The money has been returned to your payment method." : "You haven't been charged. You can try again with the same or a different card."}
      </p>
      {t && result.status !== "refunded" && (
        <Link href={`/templates/${t.slug}`} className="btn btn-primary">
          Try again
        </Link>
      )}
    </div>
  );
}
