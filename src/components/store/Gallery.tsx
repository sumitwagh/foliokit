"use client";

import { useState } from "react";
import { imageUrl } from "@/lib/images";

export function Gallery({ images, name, accent }: { images: string[]; name: string; accent: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  const current = imageUrl(images[index]);
  const isPhone = /mobile/.test(images[index]);
  return (
    <div>
      <div
        className="grid aspect-[16/11] place-items-center overflow-hidden rounded-[24px] p-[5%]"
        style={{ background: `color-mix(in srgb, ${accent} 88%, white)` }}
      >
        <img
          key={current}
          src={current ?? ""}
          alt={`${name} screenshot ${index + 1} of ${images.length}`}
          width={1600}
          height={1000}
          className={`max-h-full rounded-[10px] object-contain shadow-[0_30px_60px_-28px_rgba(23,23,27,.6)] ${isPhone ? "h-full w-auto rounded-[22px] border-[6px] border-ink" : "w-full"}`}
          style={{ animation: "fade-in .35s ease" }}
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3" role="group" aria-label="Screenshots">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show screenshot ${i + 1}`}
              aria-pressed={i === index}
              className={`h-20 w-28 overflow-hidden rounded-xl border-2 bg-surface transition-colors ${i === index ? "border-ink" : "border-transparent hover:border-line-2"}`}
            >
              <img src={imageUrl(src) ?? ""} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
