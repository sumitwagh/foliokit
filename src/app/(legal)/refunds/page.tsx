import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Refund policy" };

export default function Refunds() {
  return (
    <>
      <h1>Refund policy</h1>
      <p className="text-sm text-muted">Last updated: October 2026</p>
      <p>
        We want you to be happy with your template. If it isn&apos;t right for you, email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> within <strong>{site.refundDays} days</strong> of your purchase with your
        order reference, and tell us briefly what went wrong.
      </p>
      <ul>
        <li>Refunds go back to your original payment method through Dodo Payments, usually within 5 to 10 business days.</li>
        <li>When a refund is processed, the template is removed from your library and its license ends.</li>
        <li>Because templates are digital downloads, we may decline repeated refund requests from the same person.</li>
      </ul>
      <p>If a template has a bug, tell us first: we&apos;ll usually fix it quickly and the update is free.</p>
    </>
  );
}
