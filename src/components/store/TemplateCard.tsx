import Link from "next/link";
import type { Template } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { BrowserFrame } from "@/components/store/BrowserFrame";

export function TemplateCard({ t, priority = false }: { t: Template; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <div
        className="relative overflow-hidden rounded-[22px] px-[7%] pt-[7%]"
        style={{ background: `color-mix(in srgb, ${t.accent_color} 88%, white)` }}
      >
        <div className="translate-y-3 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:translate-y-0">
          <BrowserFrame src={t.cover_path} alt={`${t.name} template homepage`} eager={priority} className="rounded-b-none" />
        </div>
        {t.is_free && (
          <span className="absolute left-4 top-4 rounded-full bg-surface px-3 py-1 text-[13px] font-semibold text-ink shadow-sm">Free</span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">
          <Link href={`/templates/${t.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t.name}
          </Link>
        </h3>
        <span className="shrink-0 text-[17px] font-semibold tabular-nums">{formatPrice(t.price_cents, t.currency)}</span>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{t.tagline}</p>
      {t.category && <p className="mt-2 text-sm text-muted">{t.category.name}</p>}
    </article>
  );
}
