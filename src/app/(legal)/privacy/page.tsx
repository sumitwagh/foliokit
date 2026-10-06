import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="text-sm text-muted">Last updated: October 2026</p>
      <p>This page explains what {site.name} collects, why, and what you can ask us to do with it.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address and an encrypted (hashed) password.</li>
        <li>Orders: which templates you bought, when, the amount and the payment reference.</li>
        <li>Downloads: which templates you downloaded and when, so we can help if something goes wrong.</li>
        <li>Your choice about receiving emails about new templates.</li>
      </ul>
      <p>
        We never see or store your card or bank details. Payments are handled by Dodo Payments, who process them under their own privacy policy.
      </p>
      <h2>Who processes your data</h2>
      <ul>
        <li>Supabase: hosts our database, login system and template files.</li>
        <li>Dodo Payments: processes payments and sends receipts.</li>
        <li>Our hosting provider (Netlify): serves the website.</li>
        <li>Our email provider: sends account emails such as password resets.</li>
      </ul>
      <h2>Emails</h2>
      <p>We send account and purchase emails. We only send news about templates if you opted in, and every such email lets you unsubscribe.</p>
      <h2>Cookies</h2>
      <p>We use only the cookies needed to keep you logged in. We don&apos;t use advertising or tracking cookies.</p>
      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, ask us to correct it, or ask us to delete your account by emailing{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. We keep order records as long as tax law requires.
      </p>
    </>
  );
}
