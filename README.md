# Foliokit: a portfolio template store

A complete store for selling portfolio website templates: landing page, template catalogue,
accounts, secure checkout with Dodo Payments, protected downloads and an admin dashboard.

**New here? Read [SETUP.md](SETUP.md).** It walks you through every account, key and click,
from an empty laptop to a live store.

## What's inside

| Area | Where |
|---|---|
| Landing page | `src/app/page.tsx` |
| Template catalogue (search, filter, sort) | `src/app/templates/` |
| Product pages | `src/app/templates/[slug]/page.tsx` |
| Sign up, log in, password reset | `src/app/(auth)/`, `src/app/auth/` |
| Customer library, orders, profile | `src/app/account/` |
| Checkout, payment webhook, downloads | `src/app/api/` |
| Admin dashboard | `src/app/admin/` |
| Store name, support email, refund days, reviews | `src/config/site.ts` |
| Database tables and security rules | `supabase/schema.sql` |
| Starter templates (content) | `supabase/seed.sql` |
| Starter template files to sell | `product-files/*.zip` |
| Live previews and screenshots | `public/previews/`, `public/covers/` |

## Everyday commands

```bash
npm install            # once, after downloading the project
npm run dev            # run the store on http://localhost:3000
npm run build          # check that everything compiles (Netlify runs this too)
npm run upload-files   # upload the starter template .zip files to Supabase (once)
```

## How a sale works

1. A signed-in customer clicks **Buy**. The server creates a *pending* order and asks Dodo Payments for a checkout page.
2. The customer pays on Dodo's secure page (cards worldwide, UPI in India).
3. Dodo calls `/api/webhooks/dodo`. The store checks the signature, marks the order *paid* (exactly once), and the template appears in the customer's library.
4. Downloads go through `/api/download/[slug]`, which checks the purchase and hands out a private link that expires after 60 seconds.
5. A full refund in Dodo automatically removes access.

## Tech

Next.js 15 (App Router) · Supabase (Postgres, Auth, Storage) · Dodo Payments · Tailwind CSS 4 · Netlify.
