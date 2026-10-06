import { imageUrl } from "@/lib/images";

/** A screenshot shown inside a simple browser window. */
export function BrowserFrame({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const url = imageUrl(src);
  return (
    <div className={`overflow-hidden rounded-[10px] bg-surface shadow-[0_24px_50px_-24px_rgba(23,23,27,.45),0_0_0_1px_rgba(23,23,27,.08)] ${className}`}>
      <div className="flex h-6 items-center gap-1.5 border-b border-line bg-[#fbfbf9] px-3" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-line-2" />
        <span className="h-2 w-2 rounded-full bg-line-2" />
        <span className="h-2 w-2 rounded-full bg-line-2" />
      </div>
      {url ? (
        <img
          src={url}
          alt={alt}
          width={1600}
          height={1000}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block aspect-[16/10] w-full object-cover object-top"
        />
      ) : (
        <div className="grid aspect-[16/10] place-items-center text-sm text-muted">No preview yet</div>
      )}
    </div>
  );
}
