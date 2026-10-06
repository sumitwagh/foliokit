export type FaqItem = { q: string; a: React.ReactNode };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-[17px] font-semibold">
            {item.q}
            <span
              aria-hidden="true"
              className="relative h-7 w-7 shrink-0 rounded-full border border-line-2 transition-transform duration-300 group-open:rotate-45"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-ink" />
              <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-ink" />
            </span>
          </summary>
          <div className="max-w-[65ch] pb-5 text-[16px] leading-relaxed text-ink-2">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
