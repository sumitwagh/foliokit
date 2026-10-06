"use client";

import Form from "next/form";
import { useRef } from "react";
import type { SortKey } from "@/lib/catalog";

type Props = {
  q: string;
  category: string;
  price: string;
  sort: SortKey;
  categories: { slug: string; name: string; count: number }[];
  sorts: { value: SortKey; label: string }[];
};

/** Search, category, price and sort controls. They live in the URL, so results can be shared and bookmarked. */
export function BrowseFilters({ q, category, price, sort, categories, sorts }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <Form ref={formRef} action="/templates" replace scroll={false} className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search templates</span>
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            name="q"
            id="browse-q"
            defaultValue={q}
            placeholder="Search by name or style, like “dark” or “swiss”"
            className="input pl-11"
            autoComplete="off"
            onChange={() => {
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(submit, 350);
            }}
          />
        </label>
        <label className="flex items-center gap-2 sm:w-64">
          <span className="sr-only">Sort by</span>
          <select name="sort" id="browse-sort" defaultValue={sort} onChange={submit} className="input">
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Category</legend>
          <Chip name="category" value="" checked={!category} label="All categories" onChange={submit} />
          {categories.map((c) => (
            <Chip key={c.slug} name="category" value={c.slug} checked={category === c.slug} label={`${c.name} (${c.count})`} onChange={submit} />
          ))}
        </fieldset>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Price</legend>
          <Chip name="price" value="all" checked={price === "all"} label="Any price" onChange={submit} />
          <Chip name="price" value="free" checked={price === "free"} label="Free" onChange={submit} />
          <Chip name="price" value="paid" checked={price === "paid"} label="Paid" onChange={submit} />
        </fieldset>
      </div>
      <noscript>
        <button type="submit" className="btn btn-primary">
          Apply filters
        </button>
      </noscript>
    </Form>
  );
}

function Chip({ name, value, checked, label, onChange }: { name: string; value: string; checked: boolean; label: string; onChange: () => void }) {
  const id = `${name}-${value || "all"}`;
  return (
    <span>
      <input type="radio" id={id} name={name} value={value} defaultChecked={checked} onChange={onChange} className="peer sr-only" />
      <label
        htmlFor={id}
        className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-line-2 bg-surface px-4 text-[15px] font-medium text-ink-2 transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-plum"
      >
        {label}
      </label>
    </span>
  );
}
