import Link from "next/link";
import { getBundle, getCategoriesWithCounts, getShelf } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { site, reviews } from "@/config/site";
import { TemplateShelf } from "@/components/store/TemplateShelf";
import { TemplateCard } from "@/components/store/TemplateCard";
import { BrowserFrame } from "@/components/store/BrowserFrame";
import { SpecimenFonts } from "@/components/store/SpecimenFonts";
import { Faq } from "@/components/store/Faq";
import { imageUrl } from "@/lib/images";

// Rebuild this page at most every 5 minutes (and instantly when you edit templates in admin).
export const revalidate = 300;

export default async function HomePage() {
  const [templates, categories, bundle] = await Promise.all([getShelf(), getCategoriesWithCounts(), getBundle()]);
  const paid = templates.filter((t) => !t.is_free);
  const free = templates.find((t) => t.is_free);
  const minPrice = paid.length ? Math.min(...paid.map((t) => t.price_cents)) : 0;
  const maxPrice = paid.length ? Math.max(...paid.map((t) => t.price_cents)) : 0;
  const shownReviews = reviews.filter((r) => !r.sample || process.env.NODE_ENV !== "production");

  return (
    <>
      <SpecimenFonts items={templates} />

      {/* ───────── Hero ───────── */}
      <section className="container-x pb-14 pt-12 md:pb-20 md:pt-20">
        <div className="grid items-end gap-8 md:grid-cols-[1.7fr_1fr] md:gap-16">
          <h1 className="text-[clamp(40px,5.8vw,80px)] font-semibold leading-[0.98] tracking-[-0.035em]">
            Portfolio websites for designers who&apos;d rather be designing.
          </h1>
          <div className="md:pb-2">
            <p className="text-[18px] leading-relaxed text-ink-2">
              {templates.length} hand-built templates for product, UX and motion designers. Pick one, swap in your case studies,
              publish it this week. One-time price, no subscription.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/templates" className="btn btn-primary">
                Browse templates
              </Link>
              {free && (
                <Link href={`/templates/${free.slug}`} className="btn btn-secondary">
                  Get {free.name} free
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 md:mt-16">
          <TemplateShelf templates={templates} />
        </div>
      </section>

      {/* ───────── All templates ───────── */}
      <section id="templates" className="container-x scroll-mt-24 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">Pick a starting point</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-2">
              Each template has its own typography, layout and motion, so your portfolio doesn&apos;t look like everyone else&apos;s.
            </p>
          </div>
          <Link href="/templates" className="btn btn-secondary">
            See all {templates.length} templates
          </Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {templates.slice(0, 4).map((t, i) => (
            <TemplateCard key={t.id} t={t} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* ───────── Categories ───────── */}
      {categories.some((c) => c.count > 0) && (
        <section className="container-x py-12 md:py-16">
          <h2 className="text-[clamp(26px,3vw,36px)] font-semibold tracking-[-0.03em]">Browse by the work you do</h2>
          <ul className="mt-8 grid border-t border-line md:grid-cols-2">
            {categories.filter((c) => c.count > 0).map((c) => (
              <li key={c.id} className="border-b border-line md:odd:border-r md:odd:pr-8 md:even:pl-8">
                <Link href={`/templates?category=${c.slug}`} className="group flex items-center justify-between gap-6 py-6">
                  <span>
                    <span className="block text-xl font-semibold tracking-tight transition-colors group-hover:text-plum">{c.name}</span>
                    <span className="mt-1 block text-[15px] text-muted">{c.description}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-semibold tabular-nums text-ink-2">
                    {c.count} {c.count === 1 ? "template" : "templates"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───────── Free template ───────── */}
      {free && (
        <section id="free" className="scroll-mt-24 py-16 md:py-24">
          <div className="container-x">
            <div className="grid items-center gap-10 overflow-hidden rounded-[28px] bg-surface p-6 md:grid-cols-[1fr_1.15fr] md:p-14">
              <div>
                <p className="text-[15px] font-semibold text-plum">Free with an account</p>
                <h2 className="mt-2 text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">
                  Start with {free.name}. It costs nothing.
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{free.tagline} It&apos;s the complete template, not a trial, with the same guide and license as the paid ones.</p>
                <ul className="mt-6 grid gap-2.5 text-[15px] text-ink-2">
                  {free.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-2">
                  <Link href={`/templates/${free.slug}`} className="btn btn-primary">
                    Download {free.name} free
                  </Link>
                  {free.preview_url && (
                    <a href={free.preview_url} target="_blank" rel="noopener" className="btn btn-secondary">
                      Open live preview
                    </a>
                  )}
                </div>
              </div>
              <div className="relative pb-10 md:pb-0">
                <BrowserFrame src={free.cover_path} alt={`${free.name} homepage on desktop`} />
                {free.gallery_paths[1] && (
                  <img
                    src={imageUrl(free.gallery_paths[1]) ?? ""}
                    alt={`${free.name} on a phone`}
                    width={390}
                    height={844}
                    loading="lazy"
                    className="absolute -bottom-2 right-3 w-[26%] rounded-[18px] border-[5px] border-ink shadow-[0_24px_40px_-20px_rgba(23,23,27,.6)] md:-bottom-10 md:-right-4"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────── What you get ───────── */}
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">What every template includes</h2>
          <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {[
              ["One file, no build tools", "Open index.html and it works. No frameworks, no npm, nothing to install."],
              ["Case studies from one list", "Write each project once in a simple list. Its page, card and navigation are created for you."],
              ["Every screen size", "Layouts are designed for phone, tablet and desktop, not squeezed to fit."],
              ["Accessible by default", "Readable contrast, keyboard navigation and visible focus states throughout."],
              ["Motion with manners", "Animations are part of each design, and they switch off for visitors who prefer reduced motion."],
              ["A guide written for humans", "A README that shows exactly where to change your name, projects, colours and fonts."],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-line pt-4">
                <dt className="text-[17px] font-semibold">{title}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="container-x py-16 md:py-24">
        <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">From checkout to online in an afternoon</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Choose and preview", "Open any template's live preview and click through every page before you decide."],
            ["Pay once, securely", "Checkout is handled by Dodo Payments. Cards work worldwide, and UPI works for buyers in India."],
            ["Download and publish", "Your template is in your library immediately. Edit it, then drag the folder onto a free host like Netlify."],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-[22px] bg-surface p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[15px] font-semibold text-white">{i + 1}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Pricing ───────── */}
      <section id="pricing" className="container-x scroll-mt-24 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">Simple pricing. Pay once, keep it.</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-2">No subscriptions and no renewals. Prices are in US dollars and already include sales tax or VAT where it applies.</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <PriceCard
            name="Free template"
            price="$0"
            note="with a free account"
            items={[`${free?.name ?? "One"} template, complete`, "Setup guide and license", "Download it any time from your library"]}
            cta={free ? { href: `/templates/${free.slug}`, label: `Get ${free.name}` } : { href: "/signup", label: "Create an account" }}
          />
          <PriceCard
            name="Single template"
            price={minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)}–${formatPrice(maxPrice)}`}
            note="per template, one time"
            items={["Full source of one template", "Setup guide and license for one portfolio", "Free updates to version 1.x", `${site.refundDays}-day refund policy`]}
            cta={{ href: "/templates", label: "Browse templates" }}
          />
          {bundle && (
            <PriceCard
              dark
              name={bundle.name}
              price={formatPrice(bundle.price_cents)}
              note="one time, every template"
              items={["Every template in the library", "Every template released later", "Free updates for all of them", `Saves ${formatPrice(paid.reduce((s, t) => s + t.price_cents, 0) - bundle.price_cents)} on today's templates`]}
              cta={{ href: `/templates/${bundle.slug}`, label: `Get the ${bundle.name}` }}
            />
          )}
        </div>
      </section>

      {/* ───────── Reviews ───────── */}
      {shownReviews.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">From designers using them</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {shownReviews.map((r, i) => (
              <figure key={i} className="flex flex-col justify-between gap-8 rounded-[22px] bg-surface p-7">
                <blockquote className="text-[17px] leading-relaxed">“{r.quote}”</blockquote>
                <figcaption className="text-sm">
                  <span className="block font-semibold">
                    {r.name}
                    {r.sample && <span className="ml-2 rounded-full bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn">Sample, hidden on the live site</span>}
                  </span>
                  <span className="text-muted">
                    {r.role}, using {r.template}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ───────── FAQ ───────── */}
      <section id="faq" className="container-x scroll-mt-24 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-[-0.03em]">Questions</h2>
            <p className="mt-3 text-[15px] text-ink-2">
              Something else? Email <a className="underline underline-offset-4 hover:text-plum" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
            </p>
          </div>
          <Faq
            items={[
              { q: "Do I need to know how to code?", a: "No. Each template is a single HTML file with a guide that shows exactly which lines to change for your name, projects, colours and fonts. If you can edit text in a code editor, you can do this." },
              { q: "What do I get when I buy?", a: "A .zip with the complete template (index.html), a README customization guide and a license file. It appears in your library straight after payment, and you can download it again any time." },
              { q: "How does payment work? Is it secure?", a: "Checkout runs on Dodo Payments, our merchant of record. They handle your card details and calculate any sales tax, VAT or GST for your country. We never see or store your card number." },
              { q: "Will I be charged again later?", a: "No. Every price on this site is a one-time payment, including the All-Access Pass." },
              { q: "Can I use a template for a client?", a: <>Yes, one license covers one portfolio website: yours, or one client&apos;s. You can&apos;t resell the template itself. Read the <Link href="/license" className="underline underline-offset-4">license</Link>.</> },
              { q: "Where do I host my portfolio?", a: "Anywhere that serves a static website. The guide shows the free Netlify Drop method: drag your folder into the browser and get a live link in seconds." },
              { q: "What if the template isn't right for me?", a: <>Email us within {site.refundDays} days of purchase and we&apos;ll refund you. See the <Link href="/refunds" className="underline underline-offset-4">refund policy</Link>.</> },
              { q: "Do templates get updates?", a: "Yes. Fixes and improvements to version 1.x are free, and the newest file is always the one in your library." },
            ]}
          />
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="container-x pb-8 pt-8">
        <div className="relative overflow-hidden rounded-[28px] bg-plum px-6 py-14 text-white md:px-14 md:py-20">
          <h2 className="max-w-2xl text-[clamp(32px,4.4vw,58px)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Your next role starts with someone opening your portfolio.
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/80">Make the first thing they see feel considered.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/templates" className="btn bg-white text-ink hover:bg-lilac">
              Browse templates
            </Link>
            {free && (
              <Link href={`/templates/${free.slug}`} className="btn border border-white/40 text-white hover:border-white">
                Start with the free one
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function PriceCard({ name, price, note, items, cta, dark = false }: { name: string; price: string; note: string; items: string[]; cta: { href: string; label: string }; dark?: boolean }) {
  return (
    <div className={`flex flex-col rounded-[22px] p-7 ${dark ? "bg-ink text-white" : "bg-surface"}`}>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{price}</span>
        <span className={dark ? "text-white/70" : "text-muted"}>{note}</span>
      </p>
      <ul className={`mt-6 grid gap-2.5 text-[15px] ${dark ? "text-white/85" : "text-ink-2"}`}>
        {items.map((i) => (
          <li key={i} className="flex gap-3">
            <Check light={dark} /> {i}
          </li>
        ))}
      </ul>
      <Link href={cta.href} className={`btn mt-8 ${dark ? "bg-white text-ink hover:bg-lilac" : "btn-secondary"}`}>
        {cta.label}
      </Link>
    </div>
  );
}

function Check({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`mt-0.5 h-5 w-5 shrink-0 ${light ? "text-lilac" : "text-plum"}`} aria-hidden="true">
      <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
