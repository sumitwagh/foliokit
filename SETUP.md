# Setup guide: from zero to selling

This guide assumes you've never set up a web app before. Follow the parts in order.
Each part says **why** you need a service, **what it costs**, and **exactly what to click**.
Dashboard menus change from time to time; if a name differs slightly, look for the closest match.

Budget about **2–3 hours** for the first run-through. Most of it is waiting for accounts to verify.

---

## What you'll set up

| Service | Why you need it | Cost |
|---|---|---|
| **GitHub** | Stores your code. Netlify rebuilds your site every time you push a change. | Free |
| **Supabase** | Database (templates, orders), logins, and private file storage for your template zips. | Free plan. Pro is $25/month later, only if you outgrow it. |
| **Resend** | Sends login emails (confirm account, reset password). Supabase's built-in email is for testing only and sends just a few emails per hour. | Free: 3,000 emails/month (100 per day) |
| **Dodo Payments** | Takes payments and is the *merchant of record*: it handles VAT/GST/sales tax worldwide, receipts, refunds and chargebacks. | **No monthly fee.** Per sale: 4% + $0.40, plus 1.5% for non-US cards. Payouts: $5 per payout under $1,000. |
| **Netlify** | Hosts the website. Its free plan allows commercial sites (Vercel's free plan does not). | Free plan (300 credits/month) |
| **A domain** | yourname.com | About $10–15/year |

**What a $12 sale earns you:** $12 − 4% ($0.48) − $0.40 = **$11.12** for a US card, or **$10.94** for a card from outside the US.
Because your prices include tax, any VAT/GST/sales tax Dodo collects for the buyer's country also comes out of the price (for example ~18% for buyers in India, ~20% in much of Europe, often none in the US). Check Dodo's pricing page for current rates before you launch.

---

## Part 1: Install the tools on your computer

1. Install **Node.js 22 (LTS)** from https://nodejs.org. Accept the defaults.
2. Install **VS Code** from https://code.visualstudio.com (a free code editor).
3. Unzip this project somewhere easy, like `Documents/foliokit`.
4. In VS Code: **File → Open Folder…** → choose the `foliokit` folder.
5. Open the terminal inside VS Code: **Terminal → New Terminal**. Run:

   ```bash
   npm install
   ```

   This downloads the libraries the store uses (takes a minute or two).

6. Make your settings file: duplicate `.env.example` and rename the copy to `.env.local`.
   You'll fill it in during the next parts. `.env.local` stays on your computer and is never uploaded.

---

## Part 2: Supabase (database, logins, file storage)

### Create the project
1. Go to https://supabase.com → **Start your project** → sign up (GitHub sign-in is easiest).
2. Click **New project**. Pick a name (`foliokit`), set a strong **database password** (save it in a password manager), choose the region closest to your customers (for example *Mumbai* or *Frankfurt*), and keep the **Free** plan.
3. Wait about 2 minutes while it's created.

### Create the tables and security rules
1. In the left sidebar open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project in VS Code, copy **all** of it, paste it into the editor and click **Run**. You should see "Success. No rows returned".
3. New query again. Copy all of `supabase/seed.sql`, paste, **Run**. This adds your 4 categories, 5 templates and the All-Access Pass.

### Copy the keys into `.env.local`
1. Open **Project Settings** (gear icon) → **API Keys** (on older dashboards: **API**).
2. Copy these into `.env.local`:

   | In Supabase | In `.env.local` |
   |---|---|
   | Project URL (Settings → Data API, looks like `https://abcd.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
   | **Publishable** key (or legacy **anon / public** key) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **Secret** key (or legacy **service_role** key) | `SUPABASE_SERVICE_ROLE_KEY` |

   ⚠️ The secret key can do anything to your database. Never paste it into a page, a chat, an email or GitHub. It only ever goes in `.env.local` and Netlify's environment variables.

### Upload the template files you're selling
In the VS Code terminal:

```bash
npm run upload-files
```

You should see five ✓ lines. This puts the five `.zip` files from `product-files/` into a **private** storage bucket.
(Later you can replace or add files in the admin dashboard.)

### Tell Supabase where your site lives
**Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3000` for now (you'll change it to your real domain in Part 6).
- **Redirect URLs:** add `http://localhost:3000/**` (and later `https://yourdomain.com/**`).

### Use the store's email templates
**Authentication → Emails** (or **Email Templates**):
1. **Confirm signup**: set the subject to `Confirm your email` and replace the message body with the contents of `supabase/email-templates/confirm-signup.html`.
2. **Reset password**: set the subject to `Reset your password` and paste `supabase/email-templates/reset-password.html`.

These links work even if a customer opens the email on a different device from the one they signed up on.

### Test it
```bash
npm run dev
```
Open http://localhost:3000. You should see the store with your five templates.
Sign up with your own email. With Supabase's built-in email you'll get the confirmation email (slowly, and only a few per hour); Part 3 fixes that.

### Make yourself the admin
1. Sign up on your local site with the email you'll use to run the store, and confirm it.
2. In Supabase **SQL Editor**, run (with your email):
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Refresh the site. Your account menu now has **Admin dashboard**.

---

## Part 3: Resend (reliable login emails)

Why: Supabase's built-in email is rate-limited to a few emails per hour and lands in spam. Customers who don't get a confirmation email can't download anything.

1. Sign up at https://resend.com (free).
2. **Domains → Add domain** → enter your domain (for example `mail.yourdomain.com` or `yourdomain.com`). Resend shows a few **DNS records**; add them at your domain registrar (Part 6 explains where), then click **Verify**. This can take from minutes to a few hours.
3. **API Keys → Create API key** (permission: *Sending access*). Copy it now: it's shown once.
4. Back in Supabase: **Authentication → Emails → SMTP Settings** → turn on **Enable custom SMTP**:

   | Field | Value |
   |---|---|
   | Sender email | `hello@yourdomain.com` (on your verified domain) |
   | Sender name | Your store name |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | your Resend API key |

5. In Supabase **Authentication → Rate Limits**, raise "emails per hour" to something like 100.
6. **Test:** on your site, use **Forgot password?** with your email. The email should arrive within a minute.

> Don't have a domain yet? Skip this part for now and come back after Part 6. Everything else works without it.

---

## Part 4: Dodo Payments (getting paid)

Why Dodo: no monthly fee, accepts individuals from India (no company needed), supports cards worldwide and UPI for Indian buyers, and handles international tax for you as the merchant of record.

### Create the account
1. Sign up at https://dodopayments.com.
2. Complete **business verification (KYC)**: your ID, PAN, address and bank account for payouts. Choose *individual* if you're not a registered company.
3. Dodo reviews your website before you can take live payments. The store already includes the pages they look for: **Terms**, **Privacy**, **Refund policy**, **License** and a contact email. Make sure your site is live (Part 5) and that `src/config/site.ts` has your real name and email.

### Test mode first
Everything below starts in **Test mode** (there's a switch in the Dodo dashboard). Test payments use fake cards; no real money moves.

1. **Developer → API Keys → Create** → copy it into `.env.local` as `DODO_PAYMENTS_API_KEY`.
2. Set `DODO_PAYMENTS_ENVIRONMENT=test_mode` in `.env.local`.
3. Webhooks need a public URL, so you'll add the webhook **after deploying** (Part 5, step 6). For now, put any placeholder like `whsec_placeholder` in `DODO_PAYMENTS_WEBHOOK_KEY`.

### Connect your templates to Dodo
You don't create products in Dodo by hand. The admin dashboard does it:
1. Restart `npm run dev` (Ctrl+C, then run it again) so it picks up the new keys.
2. Go to **/admin → Templates**, open each paid template (Marginalia, Kinetica, Studio Verne, Ledger, All-Access Pass) and click **Save changes**.
3. Each save creates or updates the matching Dodo product with the same name and price. The **Overview** page warns you if anything isn't connected yet.

> Prices you set include tax (VAT/GST/sales tax). The customer pays exactly the price on your site; Dodo pays the tax out of it.

---

## Part 5: Put it online with Netlify

### Push your code to GitHub
1. Create a free account at https://github.com.
2. Install **GitHub Desktop** (https://desktop.github.com), sign in.
3. **File → Add local repository** → choose the `foliokit` folder → **Publish repository** (keep it **Private**).

`.env.local` is never uploaded. That's intentional: your secrets stay on your computer.

### Create the site
1. Sign up at https://www.netlify.com with your GitHub account.
2. **Add new project → Import an existing project → GitHub** → pick your `foliokit` repository.
3. Netlify detects Next.js. Leave the build settings as they are.
4. Before deploying, open **Environment variables** (or **Site configuration → Environment variables** after creation) and add **every line** from your `.env.local`, with one change:
   - `NEXT_PUBLIC_SITE_URL` = your Netlify address, like `https://foliokit-abc123.netlify.app` (change it to your domain in Part 6).
5. Click **Deploy**. After about 2–4 minutes your store is live at the Netlify address.
6. In Supabase **Authentication → URL Configuration**, set **Site URL** to that Netlify address and add `https://foliokit-abc123.netlify.app/**` to **Redirect URLs**.

### Add the payment webhook
This is how Dodo tells your store "this person paid".
1. Dodo dashboard (still in **Test mode**) → **Developer → Webhooks → Add endpoint**.
2. URL: `https://YOUR-SITE/api/webhooks/dodo`
3. Events: `payment.succeeded`, `payment.failed`, `payment.cancelled`, `refund.succeeded` (or simply all events; the store ignores the rest).
4. Save, then copy the endpoint's **signing secret** (starts with `whsec_`).
5. In Netlify **Environment variables**, set `DODO_PAYMENTS_WEBHOOK_KEY` to it. Also update your local `.env.local`.
6. **Deploys → Trigger deploy → Deploy site** so the new value takes effect.

### Test a purchase (test mode)
1. On your live site, sign up as a "customer" with a second email address.
2. Open any paid template → **Buy**. On Dodo's page, use a **test card** from Dodo's docs (search "Dodo Payments test cards").
3. You should land on **Payment confirmed** and be able to **Download**.
4. Check **/admin → Orders**: the order shows as **Paid**.
5. Refund it from the Dodo dashboard and confirm the template disappears from that customer's library.

---

## Part 6: Your domain and HTTPS

1. Buy a domain from any registrar (Namecheap, Cloudflare, GoDaddy, Hostinger…). Around $10–15/year.
2. Netlify: **Domain management → Add a domain** → type it in → follow Netlify's instructions. Either point your registrar's **nameservers** to Netlify (easiest) or add the DNS records Netlify shows.
3. **HTTPS is free and automatic.** Netlify issues the certificate once DNS works (minutes to a few hours).
4. Update everything that mentions the old address:
   - Netlify env var `NEXT_PUBLIC_SITE_URL` → `https://yourdomain.com`, then redeploy.
   - Supabase **Site URL** → `https://yourdomain.com`, and add `https://yourdomain.com/**` to **Redirect URLs**.
   - Dodo webhook URL → `https://yourdomain.com/api/webhooks/dodo`.
5. Now do Part 3 (Resend) if you skipped it, using this domain.

---

## Part 7: Go live (real money)

1. Make sure Dodo has **approved your business** and you've added your **payout bank account**.
2. Switch the Dodo dashboard to **Live mode**. Create a **live API key** and a **live webhook** (same URL and events as before; copy the new signing secret).
3. In Netlify env vars set:
   - `DODO_PAYMENTS_API_KEY` = live key
   - `DODO_PAYMENTS_WEBHOOK_KEY` = live webhook secret
   - `DODO_PAYMENTS_ENVIRONMENT` = `live_mode`

   Then redeploy.
4. Open **/admin → Templates** and click **Save changes** on every paid template once more. This creates the *live* Dodo products (test-mode products don't exist in live mode).
5. Buy your cheapest template with your own card, check you can download it, then refund yourself in Dodo.

You're selling. 🎉

---

## Updating your store later

- **Change text, prices or images of a template:** /admin → Templates. No code needed; changes appear within a minute.
- **Add a new template:** /admin → Templates → **Add a template**. Save, then upload its `.zip` on the next screen.
- **Change code or copy on pages:** edit in VS Code → in GitHub Desktop **Commit** and **Push** → Netlify redeploys automatically in a few minutes.
- **Store name, support email, refund days, social links:** `src/config/site.ts`.
- **Reviews on the landing page:** `src/config/site.ts`. The three samples are hidden on the live site automatically; add real ones from real customers (with their permission).

## Keeping it healthy (free plan notes)

- **Supabase free projects pause after 7 days with zero activity.** The store includes a tiny daily Netlify task (`netlify/functions/keep-alive.mts`) that keeps it awake. If it ever pauses, open the Supabase dashboard and click **Restore**.
- **Netlify's free plan** gives 300 credits a month. Each deploy uses 15, so avoid pushing dozens of tiny changes a day. The dashboard shows your usage.
- **Backups:** the free Supabase plan has no automatic backups. Once a month, export your tables from **Table Editor → Export to CSV**, or move to Supabase Pro when you're earning.

## Troubleshooting

| Problem | Fix |
|---|---|
| Site shows "Almost there: connect your services" | A setting is missing. The page lists which. Add it to `.env.local` (local) or Netlify env vars (live) and restart/redeploy. |
| Confirmation email never arrives | Check spam. Set up Resend (Part 3). Check Supabase **Authentication → Logs**. |
| Email link says "expired" | Links work once and expire. Ask for a new one. Make sure the email templates from Part 2 are pasted in. |
| "This template isn't connected to checkout yet" | Open it in /admin and click **Save changes** (Dodo keys must be set). |
| Paid but nothing in library | Dodo dashboard → Webhooks → check deliveries. The URL must be exactly `https://yourdomain.com/api/webhooks/dodo` and `DODO_PAYMENTS_WEBHOOK_KEY` must match that endpoint's secret. The success page also double-checks with Dodo directly. |
| Download says file missing | /admin → Templates → open it → upload the `.zip`. |
| Login works locally but not live | Supabase **Redirect URLs** must include your live domain with `/**`. |

---

## Beginner launch checklist

Tick these off in order.

**Accounts**
- [ ] GitHub account
- [ ] Supabase project created (Free plan)
- [ ] Dodo Payments account, KYC submitted
- [ ] Netlify account (sign in with GitHub)
- [ ] Domain bought
- [ ] Resend account

**Make it yours**
- [ ] `src/config/site.ts`: store name, your name, support email, country
- [ ] Read the Terms, Privacy, Refund and License pages and adjust anything that doesn't fit you (they're a solid starting point, not legal advice)

**Database**
- [ ] Ran `supabase/schema.sql` in the SQL Editor
- [ ] Ran `supabase/seed.sql`
- [ ] Supabase keys copied into `.env.local`
- [ ] `npm run upload-files` showed five ✓
- [ ] Email templates pasted into Supabase (Confirm signup, Reset password)
- [ ] Signed up and made yourself admin with the SQL snippet

**Payments (test mode)**
- [ ] Dodo test API key in `.env.local`, `DODO_PAYMENTS_ENVIRONMENT=test_mode`
- [ ] Pressed **Save changes** on every paid template in /admin; the Overview shows no warnings

**Online**
- [ ] Code pushed to a private GitHub repository
- [ ] Netlify site created with all environment variables
- [ ] Supabase Site URL and Redirect URLs set to the live address
- [ ] Dodo test webhook added; `DODO_PAYMENTS_WEBHOOK_KEY` set; redeployed
- [ ] Test purchase with a Dodo test card → download works → refund removes access
- [ ] Domain connected; HTTPS padlock shows
- [ ] `NEXT_PUBLIC_SITE_URL`, Supabase URLs and Dodo webhook all use the real domain
- [ ] Resend connected; password-reset email arrives within a minute

**Live**
- [ ] Dodo business approved, payout bank account added
- [ ] Live API key, live webhook secret, `DODO_PAYMENTS_ENVIRONMENT=live_mode` in Netlify; redeployed
- [ ] Pressed **Save changes** on every paid template again (creates live products)
- [ ] One real purchase of your own, downloaded, then refunded
- [ ] Shared the link 🎉
