"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";

/** 30-day revenue bars. One series, one hue; hover or focus a bar to read its value. */
export function RevenueChart({ days }: { days: { date: string; cents: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720,
    H = 220,
    padL = 44,
    padB = 26,
    padT = 12;
  const max = Math.max(...days.map((d) => d.cents), 1000);
  const niceMax = Math.ceil(max / 1000) * 1000;
  const bw = (W - padL) / days.length;
  const y = (c: number) => padT + (H - padT - padB) * (1 - c / niceMax);
  const ticks = [0, niceMax / 2, niceMax];
  const label = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const h = hover != null ? days[hover] : null;

  return (
    <div className="relative">
      <div className="mb-2 h-6 text-sm" aria-live="polite">
        {h ? (
          <span>
            <strong>{label(h.date)}</strong>: {formatMoney(h.cents)} from {h.orders} {h.orders === 1 ? "order" : "orders"}
          </span>
        ) : (
          <span className="text-muted">Hover a bar to see that day</span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue per day for the last 30 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)">
              ${(t / 100).toLocaleString("en-US")}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = padL + i * bw;
          const top = y(d.cents);
          const barH = Math.max(H - padB - top, d.cents ? 2 : 0);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${label(d.date)}: ${formatMoney(d.cents)}`}>
              <rect x={x} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
              {barH > 0 && (
                <path
                  d={`M${x + 2},${H - padB} V${top + 4} q0,-4 4,-4 H${x + bw - 6} q4,0 4,4 V${H - padB} Z`}
                  fill="var(--color-plum)"
                  opacity={hover == null || hover === i ? 1 : 0.45}
                />
              )}
              {((i % 7 === 0 && days.length - 1 - i >= 4) || i === days.length - 1) && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-muted)">
                  {label(d.date)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke="var(--color-line-2)" strokeWidth="1" />
      </svg>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Show as a table</summary>
        <table className="mt-2 w-full max-w-sm text-left tabular-nums">
          <thead>
            <tr className="text-muted">
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 font-medium">Orders</th>
              <th className="py-1 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {days
              .filter((d) => d.orders)
              .map((d) => (
                <tr key={d.date}>
                  <td className="py-1">{label(d.date)}</td>
                  <td className="py-1">{d.orders}</td>
                  <td className="py-1">{formatMoney(d.cents)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
