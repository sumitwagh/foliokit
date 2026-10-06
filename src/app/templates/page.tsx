import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriesWithCounts, listTemplates, SORTS, type SortKey } from "@/lib/catalog";
import { TemplateCard } from "@/components/store/TemplateCard";
import { BrowseFilters } from "@/components/store/BrowseFilters";

export const metadata: Metadata = {
  title: "All portfolio templates",
  description: "Browse portfolio website templates for product, UX, motion designers and studios. Filter by category and price.",
  alternates: { canonical: "/templates" },
};

type SP = Promise<{ q?: string; category?: string; price?: string; sort?: string }>;

export default async function TemplatesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 60);
  const category = sp.category ?? "";
  const price = (["free", "paid"].includes(sp.price ?? "") ? sp.price : "all") as "all" | "free" | "paid";
  const sort = (SORTS.some((s) => s.value === sp.sort) ? sp.sort : "popular") as SortKey;

  const [templates, categories] = await Promise.all([listTemplates({ q, category, price, sort }), getCategoriesWithCounts()]);
  const activeCategory = categories.find((c) => c.slug === category);
  const filtered = Boolean(q || category || price !== "all");

  return (
    <div className="container-x pb-10 pt-10 md:pt-14">
      <h1 className="text-[clamp(34px,4.4vw,56px)] font-semibold leading-tight tracking-[-0.035em]">
        {activeCategory ? activeCategory.name : "All templates"}
      </h1>
      <p className="mt-2 max-w-2xl text-[17px] text-ink-2">
        {activeCategory ? activeCategory.description : "Every template is a complete portfolio site you can edit in an afternoon."}
      </p>

      <div className="mt-8">
        <BrowseFilters
          q={q}
          category={category}
          price={price}
          sort={sort}
          categories={categories.filter((c) => c.count > 0 || c.slug === category).map((c) => ({ slug: c.slug, name: c.name, count: c.count }))}
          sorts={SORTS}
        />
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {templates.length} {templates.length === 1 ? "template" : "templates"}
        {q && <> matching “{q}”</>}
      </p>

      {templates.length ? (
        <div className="mt-5 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <TemplateCard key={t.id} t={t} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-dashed border-line-2 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">No templates match those filters</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-2">Try a different word, or clear the filters to see everything.</p>
          {filtered && (
            <Link href="/templates" className="btn btn-secondary mt-6">
              Clear filters
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
