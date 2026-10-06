"use client";

import { useActionState, useState } from "react";
import { saveTemplate, type AdminState } from "@/app/admin/actions";
import { FormAlert } from "@/components/auth/Field";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/format";
import type { Category, Template } from "@/lib/types";

export function TemplateForm({ template, categories, created }: { template: Template | null; categories: Category[]; created?: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveTemplate, {});
  const [name, setName] = useState(template?.name ?? "");
  const [slug, setSlug] = useState(template?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(template));
  const [isFree, setIsFree] = useState(template?.is_free ?? false);
  const fe = state.fieldErrors ?? {};
  const t = template;

  return (
    <form action={action} className="grid gap-6" noValidate>
      {t && <input type="hidden" name="id" value={t.id} />}
      {created && !state.success && !state.error && <FormAlert tone="success">Template created. Now upload its file below.</FormAlert>}
      {state.error && <FormAlert>{state.error}</FormAlert>}
      {state.success && <FormAlert tone="success">{state.success}</FormAlert>}
      {state.warning && <FormAlert tone="info">{state.warning}</FormAlert>}

      <Section title="Basics">
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Name" name="name" value={name} onChange={(v) => { setName(v); if (!slugEdited) setSlug(slugify(v)); }} error={fe.name} />
          <Input label="URL name (slug)" name="slug" value={slug} onChange={(v) => { setSlug(v); setSlugEdited(true); }} error={fe.slug} hint={`Page address: /templates/${slug || "…"}`} />
        </div>
        <Input label="Tagline" name="tagline" defaultValue={t?.tagline} error={fe.tagline} hint="One sentence shown on cards and search results (max 160 characters)." />
        <div className="field">
          <label className="label" htmlFor="tf-description">Description</label>
          <textarea id="tf-description" name="description" defaultValue={t?.description} className="input min-h-[180px]" />
          <p className="hint">Leave an empty line between paragraphs.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="field">
            <label className="label" htmlFor="tf-kind">Type</label>
            <select id="tf-kind" name="kind" defaultValue={t?.kind ?? "template"} className="input">
              <option value="template">Single template</option>
              <option value="bundle">All-access bundle (unlocks every template)</option>
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="tf-category">Category</label>
            <select id="tf-category" name="category_id" defaultValue={t?.category_id ?? ""} className="input">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Search tags" name="tags" defaultValue={t?.tags.join(", ")} hint="Comma separated, like: dark, minimal" />
        </div>
      </Section>

      <Section title="Price and visibility">
        <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
          <div className="field">
            <label className="label" htmlFor="tf-price">Price in US dollars</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input id="tf-price" name="price" inputMode="decimal" defaultValue={t && !t.is_free ? (t.price_cents / 100).toString() : ""} disabled={isFree} className="input pl-7" aria-invalid={fe.price ? true : undefined} placeholder="12" />
            </div>
            {fe.price ? <p className="error-text">{fe.price}</p> : <p className="hint">Includes tax. The matching Dodo product updates when you save.</p>}
          </div>
          <div className="grid content-start gap-3 pt-1 text-[15px]">
            <Check name="is_free" label="Free template (download with a free account)" checked={isFree} onChange={setIsFree} />
            <Check name="is_published" label="Published (visible in the store)" defaultChecked={t?.is_published ?? false} />
            <Check name="is_featured" label="Featured (shown first on the home page)" defaultChecked={t?.is_featured ?? false} />
          </div>
        </div>
      </Section>

      <Section title="Images">
        <ImageUploader name="cover_path" folder={slug} initial={t?.cover_path ? [t.cover_path] : []} label="Cover image" hint="Shown on cards and the shelf. A 1600×1000 screenshot of the homepage works best." />
        <ImageUploader name="gallery_paths" folder={slug} multiple initial={t?.gallery_paths ?? []} label="Gallery images" hint="Extra screenshots for the product page. Include “mobile” in a phone screenshot's file name to show it in a phone frame." />
      </Section>

      <Section title="Product details">
        <Lines label="Features" name="features" value={t?.features} hint="One per line." />
        <Lines label="What's included" name="included" value={t?.included} hint="One per line. The first four also appear next to the Buy button." />
        <Lines label="Built with" name="tech_stack" value={t?.tech_stack} hint="One per line." />
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Pages" name="pages" defaultValue={t?.pages.join(", ")} hint="Comma separated." />
          <Input label="Live preview link" name="preview_url" defaultValue={t?.preview_url ?? ""} error={fe.preview_url} hint="https://… or /previews/file.html" />
          <Input label="Version" name="version" defaultValue={t?.version ?? "1.0.0"} />
        </div>
      </Section>

      <Section title="Shelf appearance">
        <div className="grid gap-5 md:grid-cols-3">
          <ColorInput label="Background colour" name="accent_color" defaultValue={t?.accent_color ?? "#17171B"} error={fe.accent_color} />
          <ColorInput label="Text colour" name="accent_ink" defaultValue={t?.accent_ink ?? "#FFFFFF"} error={fe.accent_ink} />
          <Input label="Display font" name="display_font" defaultValue={t?.display_font ?? ""} error={fe.display_font} hint="A Google Fonts family name, like Bodoni Moda." />
        </div>
      </Section>

      <details className="card p-6">
        <summary className="cursor-pointer font-semibold">Advanced: Dodo Payments product</summary>
        <div className="mt-4">
          <Input label="Dodo product ID" name="dodo_product_id" defaultValue={t?.dodo_product_id ?? ""} hint="Filled in automatically when you save a paid template. Only change it if you created the product in Dodo yourself." />
        </div>
      </details>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center gap-3 border-t border-line bg-paper/95 px-1 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : t ? "Save changes" : "Create template"}
        </button>
        {t && (
          <a href={`/templates/${t.slug}`} target="_blank" rel="noopener" className="btn btn-ghost">
            View in store
          </a>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card grid gap-5 p-6">
      <legend className="float-left mb-1 text-lg font-semibold">{title}</legend>
      <div className="clear-left grid gap-5">{children}</div>
    </fieldset>
  );
}

function Input({ label, name, defaultValue, value, onChange, error, hint }: { label: string; name: string; defaultValue?: string; value?: string; onChange?: (v: string) => void; error?: string; hint?: string }) {
  const id = `tf-${name}`;
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="input"
        {...(value !== undefined ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) } : { defaultValue })}
        aria-invalid={error ? true : undefined}
      />
      {error ? <p className="error-text">{error}</p> : hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function Lines({ label, name, value, hint }: { label: string; name: string; value?: string[]; hint: string }) {
  return (
    <div className="field">
      <label className="label" htmlFor={`tf-${name}`}>
        {label}
      </label>
      <textarea id={`tf-${name}`} name={name} defaultValue={value?.join("\n")} className="input min-h-[120px]" />
      <p className="hint">{hint}</p>
    </div>
  );
}

function Check({ name, label, checked, defaultChecked, onChange }: { name: string; label: string; checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        className="mt-1 h-4 w-4 accent-[var(--color-plum)]"
        {...(checked !== undefined ? { checked, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.checked) } : { defaultChecked })}
      />
      <span>{label}</span>
    </label>
  );
}

function ColorInput({ label, name, defaultValue, error }: { label: string; name: string; defaultValue: string; error?: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="field">
      <label className="label" htmlFor={`tf-${name}`}>
        {label}
      </label>
      <div className="flex gap-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(v) ? v : "#000000"} onChange={(e) => setV(e.target.value.toUpperCase())} className="h-11 w-14 cursor-pointer rounded-xl border border-line-2 bg-surface p-1" aria-label={`${label} picker`} />
        <input id={`tf-${name}`} name={name} value={v} onChange={(e) => setV(e.target.value)} className="input font-mono" aria-invalid={error ? true : undefined} />
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
