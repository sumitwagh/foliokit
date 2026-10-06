import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms of service" };

export default function Terms() {
  return (
    <>
      <h1>Terms of service</h1>
      <p className="text-sm text-muted">Last updated: October 2026</p>
      <p>
        These terms apply when you use {site.name} (the &quot;store&quot;), run by {site.ownerName} (&quot;we&quot;). By creating an account or buying a
        template you agree to them.
      </p>
      <h2>Your account</h2>
      <ul>
        <li>Give us a real email address and keep your password private. You&apos;re responsible for activity on your account.</li>
        <li>You must be old enough to enter a contract where you live.</li>
        <li>We may suspend accounts used for fraud, abuse or redistributing paid templates.</li>
      </ul>
      <h2>Buying templates</h2>
      <ul>
        <li>
          Payments are processed by Dodo Payments, who act as the merchant of record. They handle your payment details, charge any applicable
          sales tax, VAT or GST, and send your receipt.
        </li>
        <li>Prices are shown in US dollars. Your bank may convert the amount into your currency.</li>
        <li>All purchases are one-time payments. Nothing renews automatically.</li>
        <li>After payment you can download the template from your library for as long as the store operates.</li>
      </ul>
      <h2>What you may do with templates</h2>
      <p>
        Each purchase gives you a license described on the <a href="/license">license page</a>. In short: one portfolio website per license, and no
        reselling or redistributing the template.
      </p>
      <h2>Refunds</h2>
      <p>
        See our <a href="/refunds">refund policy</a>.
      </p>
      <h2>Liability</h2>
      <p>
        Templates are provided &quot;as is&quot;. We work hard to make them reliable, but we can&apos;t guarantee they suit every purpose. Our total
        liability for any claim is limited to the amount you paid for the template concerned.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. If changes are significant we&apos;ll tell account holders by email.</p>
      <h2>Contact and law</h2>
      <p>
        Questions: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. These terms are governed by the laws of {site.country}.
      </p>
    </>
  );
}
