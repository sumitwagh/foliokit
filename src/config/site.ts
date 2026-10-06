/**
 * ────────────────────────────────────────────────────────────────
 *  Your store settings. Change these to make the site yours.
 * ────────────────────────────────────────────────────────────────
 */
export const site = {
  /** Store name shown in the header, emails and page titles. */
  name: "Foliokit",
  /** One sentence used for search engines and social previews. */
  description:
    "Hand-built portfolio website templates for product, UX and motion designers. Pay once, download instantly, publish this week.",
  /** The person or business selling the templates (used in legal pages). */
  ownerName: "Sumit Wagh",
  /** Where customers can reach you. */
  supportEmail: "hello@sumitwagh.com",
  /** Country whose law applies to your terms (legal pages). */
  country: "India",
  /** How many days customers have to ask for a refund. */
  refundDays: 14,
  /** Social links in the footer. Leave a value empty ("") to hide it. */
  social: {
    x: "",
    instagram: "",
    dribbble: "",
    linkedin: "",
  },
} as const;

/**
 * Customer reviews for the landing page.
 * Only add REAL reviews from real customers (with their permission).
 * Reviews marked `sample: true` are shown while you develop the site
 * (with a "Sample" badge) and are automatically hidden on the live site.
 */
export const reviews: {
  quote: string;
  name: string;
  role: string;
  template: string;
  sample?: boolean;
}[] = [
  {
    quote:
      "I replaced my Notion portfolio with Ledger in a weekend. Two recruiters mentioned the case-study charts on the first call.",
    name: "Sample reviewer",
    role: "Senior product designer",
    template: "Ledger",
    sample: true,
  },
  {
    quote:
      "The README walked me through everything. I only touched one content array and the colours, and it looked like mine.",
    name: "Sample reviewer",
    role: "UX designer",
    template: "Raster",
    sample: true,
  },
  {
    quote:
      "Kinetica's motion lab is the first thing people play with on my site. It says more about my work than any paragraph could.",
    name: "Sample reviewer",
    role: "Motion designer",
    template: "Kinetica",
    sample: true,
  },
];
