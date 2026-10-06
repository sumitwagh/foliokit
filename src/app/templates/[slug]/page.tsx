import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShelf, getTemplate } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { publicEnv } from "@/lib/env";
import { site } from "@/config/site";
import { Gallery } from "@/components/store/Gallery";
import { BuyBox } from "@/components/store/BuyBox";
import { TemplateCard } from "@/components/store/TemplateCard";
import { SpecimenFonts } from "@/components/store/SpecimenFonts";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) return { title: "Template not found" };
  const cover = imageUrl(t.cover_path);
  return {
    title: `${t.name}: ${t.is_free ? "free " : ""}portfolio template`,
    description: t.tagline,
    alternates: { canonical: `/templates/${t.slug}` },
    openGraph: { title: `${t.name} — ${site.name}`, description: t.tagline, images: cover ? [cover] : undefined },
  };
}

export default async function TemplatePage({ params }: { params: Params }) {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) notFound();

  const isBundle = t.kind === "bundle";
  const all = await getShelf();
  const others = all.filter((x) => x.id !== t.id).slice(0, 3);
  const images = [t.cover_path, ...t.gallery_paths].filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t.name,
    description: t.tagline,
    image: images.map((i) => new URL(imageUrl(i)!, publicEnv.siteUrl).toString()),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: (t.price_cents / 100).toFixed(2),
      priceCurrency: t.currency,
      availability: "https://schema.org/InStock",
      url: `${publicEnv.siteUrl}/templates/${t.slug}`,
    },
  };

  return (
    <>
      <SpecimenFonts items={[t, ...others]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-x pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/templates" className="hover:text-ink">
            Templates
          </Link>
          {t.category && (
            <>
              <span className="mx-2" aria-hidden="true">/</span>
              <Link href={`/templates?category=${t.category.slug}`} className="hover:text-ink">
                {t.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          <div className="min-w-0">
            {isBundle ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {all.map((x) => (
                  <Link
                    key={x.id}
                    href={`/templates/${x.slug}`}
                    className="flex aspect-[4/5] items-end rounded-[20px] p-4 text-[28px] leading-none transition-transform hover:-translate-y-1"
                    style={{ background: x.accent_color, color: x.accent_ink, fontFamily: `"${x.display_font}", var(--font-sans)` }}
                  >
                    {x.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Gallery images={images} name={t.name} accent={t.accent_color} />
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h1 className="text-[clamp(44px,5vw,64px)] leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: t.display_font ? `"${t.display_font}", var(--font-sans)` : undefined }}>
              {t.name}
            </h1>
            <p className="mt-3 text-[18px] leading-relaxed text-ink-2">{t.tagline}</p>
            <div className="mt-6">
              <BuyBox slug={t.slug} name={t.name} priceCents={t.price_cents} currency={t.currency} isFree={t.is_free} isBundle={isBundle} />
            </div>
            {t.preview_url && (
              <a href={t.preview_url} target="_blank" rel="noopener" className="btn btn-secondary mt-3 h-12 w-full text-base">
                Open live preview
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <ul className="mt-6 grid gap-2 border-t border-line pt-5 text-[15px] text-ink-2">
              {t.included.slice(0, 4).map((i) => (
                <li key={i} className="flex gap-2.5">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-plum" aria-hidden="true">
                    <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {i}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted">
              Secure checkout by Dodo Payments. {site.refundDays}-day <Link href="/refunds" className="underline underline-offset-4">refund policy</Link>.
            </p>
          </aside>
        </div>

        <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">About {t.name}</h2>
            <div className="prose-store mt-4 max-w-[65ch] text-[17px] leading-relaxed text-ink-2">
              {t.description.split(/\n\s*\n/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {t.features.length > 0 && (
              <>
                <h2 className="mt-12 text-2xl font-semibold tracking-tight">Features</h2>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {t.features.map((f) => (
                    <li key={f} className="border-t border-line pt-3 text-[16px]">
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Details</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line text-[15px]">
              {[
                ["Price", formatPrice(t.price_cents, t.currency)],
                t.category ? ["Category", t.category.name] : null,
                t.pages.length ? ["Pages", t.pages.join(", ")] : null,
                ["Version", t.version],
                ["Updated", formatDate(t.updated_at)],
                ["What's included", t.included.join(". ")],
                t.tech_stack.length ? ["Built with", t.tech_stack.join(", ")] : null,
              ]
                .filter(Boolean)
                .map((row) => (
                  <div key={row![0]} className="grid grid-cols-[120px_1fr] gap-4 py-3">
                    <dt className="text-muted">{row![0]}</dt>
                    <dd>{row![1]}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-semibold tracking-tight">More templates</h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <TemplateCard key={o.id} t={o} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
