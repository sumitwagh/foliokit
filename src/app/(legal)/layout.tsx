export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="container-x max-w-3xl pb-10 pt-12 text-[17px] leading-relaxed text-ink-2 [&_h1]:text-[clamp(32px,4vw,46px)] [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:tracking-[-0.03em] [&_h1]:text-ink [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:mt-1.5 [&_p]:mt-4 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:underline [&_a]:underline-offset-4">
      {children}
    </article>
  );
}
