"use client";

import Link from "next/link";
import { useState } from "react";
import type { Template } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { BrowserFrame } from "@/components/store/BrowserFrame";

/**
 * The landing page's signature element: each template is a book spine on a shelf,
 * its name set in the template's own typeface. Hover or focus opens a spine.
 */
export function TemplateShelf({ templates }: { templates: Template[] }) {
  const [active, setActive] = useState(0);
  if (!templates.length) return null;

  return (
    <>
      {/* Desktop shelf */}
      <ul className="hidden h-[480px] gap-2.5 md:flex" aria-label="Templates">
        {templates.map((t, i) => {
          const open = i === active;
          return (
            <li
              key={t.id}
              onMouseEnter={() => setActive(i)}
              className="shelf-spine group relative min-w-0 rounded-[22px] transition-[flex-grow] duration-700 ease-[var(--ease-out-soft)]"
              style={{ flexGrow: open ? 5 : 1, flexBasis: 0, animationDelay: `${120 + i * 90}ms` }}
            >
            <Link
              href={`/templates/${t.slug}`}
              onFocus={() => setActive(i)}
              aria-label={`${t.name}, ${formatPrice(t.price_cents)}. ${t.tagline}`}
              className="absolute inset-0 overflow-hidden rounded-[22px] outline-offset-4"
              style={{ background: t.accent_color, color: t.accent_ink }}
            >
              {/* Closed: vertical spine title */}
              <span
                className="absolute inset-x-0 bottom-6 flex justify-center transition-opacity duration-300"
                style={{ opacity: open ? 0 : 1 }}
                aria-hidden="true"
              >
                <span
                  className="whitespace-nowrap text-[38px] leading-none"
                  style={{ fontFamily: `"${t.display_font}", var(--font-sans)`, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {t.name}
                </span>
              </span>
              <span
                className="absolute left-1/2 top-5 -translate-x-1/2 text-sm font-semibold tabular-nums transition-opacity duration-300"
                style={{ opacity: open ? 0 : 0.85 }}
                aria-hidden="true"
              >
                {formatPrice(t.price_cents)}
              </span>

              {/* Open: specimen + screenshot */}
              <span
                className="absolute inset-0 flex flex-col p-7 transition-opacity duration-500"
                style={{ opacity: open ? 1 : 0, transitionDelay: open ? "180ms" : "0ms" }}
                aria-hidden="true"
              >
                <span className="flex items-start justify-between gap-6">
                  <span className="text-[clamp(44px,5vw,68px)] leading-[0.95]" style={{ fontFamily: `"${t.display_font}", var(--font-sans)` }}>
                    {t.name}
                  </span>
                  <span className="mt-2 shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums" style={{ background: t.accent_ink, color: t.accent_color }}>
                    {formatPrice(t.price_cents)}
                  </span>
                </span>
                <span className="mt-3 max-w-[46ch] text-[15px] leading-snug opacity-85">{t.tagline}</span>
                <span className="relative mt-auto block translate-y-10 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:translate-y-6">
                  <BrowserFrame src={t.cover_path} alt="" eager={i < 2} className="w-[92%] min-w-[420px]" />
                </span>
              </span>
            </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile: swipeable cards */}
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Templates">
        {templates.map((t) => (
          <li key={t.id} className="w-[82%] shrink-0 snap-center">
          <Link
            href={`/templates/${t.slug}`}
            className="relative flex h-[400px] flex-col overflow-hidden rounded-[22px] p-5"
            style={{ background: t.accent_color, color: t.accent_ink }}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="text-[40px] leading-[0.95]" style={{ fontFamily: `"${t.display_font}", var(--font-sans)` }}>
                {t.name}
              </span>
              <span className="mt-1 shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold" style={{ background: t.accent_ink, color: t.accent_color }}>
                {formatPrice(t.price_cents)}
              </span>
            </span>
            <span className="mt-2 text-[15px] leading-snug opacity-85">{t.tagline}</span>
            <span className="mt-auto block translate-y-8">
              <BrowserFrame src={t.cover_path} alt="" />
            </span>
          </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
