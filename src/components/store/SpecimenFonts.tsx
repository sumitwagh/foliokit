import { specimenFontsHref } from "@/lib/images";

/** Loads each template's display typeface (only the letters needed) for specimens. */
export function SpecimenFonts({ items }: { items: { display_font: string | null; name: string }[] }) {
  const href = specimenFontsHref(items);
  if (!href) return null;
  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={href} precedence="default" />
    </>
  );
}
