import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { publicEnv, isSupabaseConfigured, missingEnv } from "@/lib/env";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SetupScreen } from "@/components/SetupScreen";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: `${site.name} — Portfolio website templates for designers`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, title: site.name, description: site.description, images: ["/covers/ledger.webp"] },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        {isSupabaseConfigured ? (
          <>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </>
        ) : (
          <SetupScreen missing={missingEnv()} />
        )}
      </body>
    </html>
  );
}
