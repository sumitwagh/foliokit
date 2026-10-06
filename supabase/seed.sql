-- =====================================================================
-- Foliokit — starter content (categories + your first templates)
-- Run AFTER schema.sql. You can edit everything later in /admin.
-- =====================================================================

insert into public.categories (name, slug, description, sort_order) values
  ('Product Design',        'product-design', 'Case-study-led portfolios for UX and product designers.', 1),
  ('Studio & Agency',       'studio',         'Portfolios for studios, agencies and creative teams.',    2),
  ('Motion & Creative',     'motion',         'Expressive, animation-first portfolios.',                  3),
  ('Minimal & Typographic', 'minimal',        'Quiet, grid-based portfolios that let the work talk.',     4)
on conflict (slug) do nothing;

insert into public.templates
  (slug, kind, name, tagline, description, category_id, tags, price_cents, is_free,
   is_published, is_featured, features, included, tech_stack, pages, preview_url, cover_path, gallery_paths, version,
   accent_color, accent_ink, display_font)
values
(
  'marginalia', 'template', 'Marginalia',
  'An editorial portfolio for product designers who write as well as they design.',
  'Marginalia reads like a well-made magazine. A highlighter-swept serif headline introduces you, fanned cards show what you do, and every case study is laid out with drop caps, margin notes and pull quotes.

It is built for designers whose work needs explaining: AI products, research tools, health software. Swap the sample content for your own projects and you have a portfolio that feels considered from the first scroll.',
  (select id from public.categories where slug = 'product-design'),
  array['editorial', 'serif', 'light', 'case studies', 'testimonials'],
  900, false, true, true,
  array['Highlighter-sweep headline animation', 'Fanned hero cards with 3D tilt', 'Filterable project grid', 'Testimonial carousel with autoplay', 'Case studies with margin notes and drop caps', 'Curtain page transitions', 'Validated contact form + copy-email button', 'Full-screen mobile menu'],
  array['Single-file HTML template (no build step)', '6 sample case studies driven by one content array', 'About page with experience & skills', 'README customization guide', 'Commercial license for one portfolio', 'Free v1.x updates'],
  array['HTML5', 'Modern CSS (custom properties)', 'Vanilla JavaScript', 'Lenis smooth scroll', 'Google Fonts: Gloock, Newsreader, IBM Plex Mono'],
  array['Home', 'Case study', 'About', 'Contact'],
  '/previews/marginalia.html', '/covers/marginalia.webp',
  array['/covers/marginalia-case.webp', '/covers/marginalia-mobile.webp'], '1.0.0',
  '#F3E870', '#1B1D2A', 'Gloock'
),
(
  'raster', 'template', 'Raster',
  'A Swiss, grid-first portfolio with one red accent and nothing extra.',
  'Raster puts the 12-column grid on show — literally. Dashed column lines frame flush-left type, headlines are revealed by a signal-red block wipe, and your projects sit in a clean index that previews each cover as you hover.

It is the template for designers who believe in restraint: transit, insurance, everyday services, accessibility work. Free to download with an account.',
  (select id from public.categories where slug = 'minimal'),
  array['swiss', 'grid', 'minimal', 'light', 'typography'],
  0, true, true, true,
  array['Visible 12-column grid (toggle with G)', 'Block-wipe headline reveals', 'Project index with hover preview', 'Index / grid view switch', 'Sticky case-study table of contents', 'Scroll progress bar', 'Accordion services section', 'Live local clock in the header'],
  array['Single-file HTML template (no build step)', '5 sample case studies', 'About page with CV and principles', 'README customization guide', 'Commercial license for one portfolio'],
  array['HTML5', 'Modern CSS (custom properties)', 'Vanilla JavaScript', 'Lenis smooth scroll', 'Google Fonts: Geist, Geist Mono'],
  array['Home', 'Case study', 'About', 'Contact'],
  '/previews/raster.html', '/covers/raster.webp',
  array['/covers/raster-case.webp', '/covers/raster-mobile.webp'], '1.0.0',
  '#FF3B1F', '#FFFFFF', 'Geist'
),
(
  'kinetica', 'template', 'Kinetica',
  'A loud, motion-first portfolio for interaction and motion designers.',
  'Kinetica moves. The hero type gets heavier as your cursor approaches, a reel you can scrub and slow down shows your timing, and projects slide past in a pinned horizontal gallery. The Lab section lets visitors play with easing curves, toggles and ripples.

Case studies include frame-by-frame timing tables, so your craft is visible, not just described.',
  (select id from public.categories where slug = 'motion'),
  array['motion', 'bold', 'interactive', 'variable fonts', 'experimental'],
  1200, false, true, true,
  array['Cursor-reactive variable-font hero', 'Scrubbable showreel with speed controls', 'Pinned horizontal project gallery', 'Interactive motion lab (easing, toggle, like, ripple)', 'Scroll-velocity marquees', 'Custom cursor with context labels', 'Blob page transitions', 'Intro gate animation'],
  array['Single-file HTML template (no build step)', '5 sample case studies with timing specs', 'About page with timeline and toolbox', 'README customization guide', 'Commercial license for one portfolio', 'Free v1.x updates'],
  array['HTML5', 'Modern CSS (custom properties)', 'Vanilla JavaScript + Web Animations API', 'Lenis smooth scroll', 'Google Fonts: Unbounded, Instrument Sans, Martian Mono'],
  array['Home', 'Case study', 'About', 'Contact'],
  '/previews/kinetica.html', '/covers/kinetica.webp',
  array['/covers/kinetica-case.webp', '/covers/kinetica-mobile.webp'], '1.0.0',
  '#2E2BFF', '#FFFDF8', 'Unbounded'
),
(
  'studio-verne', 'template', 'Studio Verne',
  'A dark, luxurious portfolio for studios and agencies that sell craft.',
  'Studio Verne is a gallery at night. A counting preloader opens onto a lit hero, case cards stack on top of each other as you scroll, and the studio manifesto lights up word by word. The enquiry form collects budget, timeline and services so leads arrive qualified.

Built for brand, packaging and digital studios with premium clients.',
  (select id from public.categories where slug = 'studio'),
  array['dark', 'luxury', 'agency', 'serif', 'studio'],
  1200, false, true, true,
  array['Counting preloader', 'Floating glass pill navigation', 'Sticky stacking case cards', 'Scroll-lit manifesto', 'Cursor-following glow and film grain', 'Services accordion and awards table', 'Qualified enquiry form (budget, timeline, services)', 'Fade-veil page transitions'],
  array['Single-file HTML template (no build step)', '5 sample case studies with palette & type specs', 'About page with partners and process', 'README customization guide', 'Commercial license for one portfolio', 'Free v1.x updates'],
  array['HTML5', 'Modern CSS (custom properties)', 'Vanilla JavaScript', 'Lenis smooth scroll', 'Google Fonts: Bodoni Moda, Hanken Grotesk'],
  array['Home', 'Case study', 'About', 'Enquiry'],
  '/previews/verne.html', '/covers/verne.webp',
  array['/covers/verne-case.webp', '/covers/verne-mobile.webp'], '1.0.0',
  '#0C0B0A', '#E4CFA9', 'Bodoni Moda'
),
(
  'ledger', 'template', 'Ledger',
  'A metrics-first portfolio for product designers who move numbers.',
  'Ledger turns your impact into the headline. An at-a-glance bento shows your results with small charts, every case card carries its key numbers, and case studies read like a well-kept report with a sticky index, before/after sliders and result charts.

Ideal for fintech, health and SaaS designers applying for senior and lead roles. Includes a light and dark theme.',
  (select id from public.categories where slug = 'product-design'),
  array['metrics', 'case studies', 'dark mode', 'saas', 'fintech'],
  1200, false, true, true,
  array['Impact bento with sparklines and bar charts', 'Count-up numbers on scroll', 'Filterable case-study cards with KPIs', 'Before/after comparison slider', 'Sticky reading index with progress', 'Light and dark themes', 'Writing and testimonials sections', 'Validated contact form'],
  array['Single-file HTML template (no build step)', '5 sample case studies with charts', 'About page with experience and skills', 'README customization guide', 'Commercial license for one portfolio', 'Free v1.x updates'],
  array['HTML5', 'Modern CSS (custom properties)', 'Vanilla JavaScript', 'Inline SVG charts', 'Lenis smooth scroll', 'Google Fonts: Bricolage Grotesque, Figtree, JetBrains Mono'],
  array['Home', 'Case study', 'About', 'Contact'],
  '/previews/ledger.html', '/covers/ledger.webp',
  array['/covers/ledger-case.webp', '/covers/ledger-mobile.webp'], '1.0.0',
  '#0D6A46', '#FFFFFF', 'Bricolage Grotesque'
),
(
  'all-access', 'bundle', 'All-Access Pass',
  'Every template in the library — today''s and every one released later.',
  'One payment, every template. The All-Access Pass unlocks all current templates and every new template added to the library, with no subscription and no renewals.',
  null,
  array['bundle'],
  2900, false, true, false,
  array['Every current template', 'Every future template', 'One payment, no renewals'],
  array['All template files', 'All future releases', 'Commercial license for one portfolio per template'],
  array['HTML5', 'CSS', 'JavaScript'],
  '{}', null, null, '{}', '1.0.0',
  '#17171B', '#FFFFFF', null
)
on conflict (slug) do nothing;
