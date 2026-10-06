-- =====================================================================
-- Foliokit — database schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run once on a fresh project. (Run seed.sql afterwards.)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES  (one row per signed-up user, created automatically)
-- ---------------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text not null,
  full_name        text check (char_length(full_name) <= 80),
  role             text not null default 'customer' check (role in ('customer', 'admin')),
  marketing_opt_in boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Is the signed-in user an admin? Used by security policies below.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, marketing_opt_in)
  values (
    new.id,
    new.email,
    nullif(left(trim(new.raw_user_meta_data ->> 'full_name'), 80), ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile email in sync if the user changes it.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email, updated_at = now() where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------
-- 2. CATEGORIES
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 40),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. TEMPLATES  (the products you sell)
--    kind = 'template' → a single template
--    kind = 'bundle'   → an all-access pass that unlocks every template
-- ---------------------------------------------------------------------
create table public.templates (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind            text not null default 'template' check (kind in ('template', 'bundle')),
  name            text not null check (char_length(name) between 2 and 80),
  tagline         text not null default '' check (char_length(tagline) <= 160),
  description     text not null default '',
  category_id     uuid references public.categories (id) on delete set null,
  tags            text[] not null default '{}',
  price_cents     int  not null default 0 check (price_cents >= 0 and price_cents <= 100000),
  currency        text not null default 'USD',
  is_free         boolean not null default false,
  is_published    boolean not null default false,
  is_featured     boolean not null default false,
  features        text[] not null default '{}',
  included        text[] not null default '{}',
  tech_stack      text[] not null default '{}',
  pages           text[] not null default '{}',
  preview_url     text,                 -- live demo link
  accent_color    text not null default '#17171B' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_ink      text not null default '#FFFFFF' check (accent_ink ~ '^#[0-9A-Fa-f]{6}$'),
  display_font    text check (display_font ~ '^[A-Za-z0-9 ]{2,40}$'),  -- a Google Fonts family name
  cover_path      text,                 -- image in the public "previews" bucket
  gallery_paths   text[] not null default '{}',
  version         text not null default '1.0.0',
  dodo_product_id text,                 -- product id in Dodo Payments (paid items only)
  purchase_count  int not null default 0,
  download_count  int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint paid_items_need_a_price check (is_free or price_cents > 0)
);

create index templates_published_idx on public.templates (is_published, kind);
create index templates_category_idx on public.templates (category_id);

-- The downloadable file lives in a PRIVATE bucket. Its path is kept in a
-- separate table that only admins can read, so it is never sent to browsers.
create table public.template_files (
  template_id     uuid primary key references public.templates (id) on delete cascade,
  file_path       text not null,
  file_name       text not null,
  file_size_bytes bigint,
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. ORDERS  (created when checkout starts, marked paid by the webhook)
-- ---------------------------------------------------------------------
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users (id) on delete set null,
  template_id         uuid not null references public.templates (id) on delete restrict,
  status              text not null default 'pending'
                      check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  amount_cents        int  not null check (amount_cents >= 0),  -- list price when checkout started
  currency            text not null default 'USD',
  paid_amount         int,             -- what the customer actually paid (incl. tax), smallest unit
  paid_currency       text,
  customer_email      text not null,
  provider            text not null default 'dodo',
  checkout_session_id text unique,
  payment_id          text unique,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  updated_at          timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_template_idx on public.orders (template_id, status);
create index orders_status_idx on public.orders (status, paid_at desc);

-- ---------------------------------------------------------------------
-- 5. DOWNLOADS  (a log of every download, for your stats)
-- ---------------------------------------------------------------------
create table public.downloads (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users (id) on delete set null,
  template_id uuid not null references public.templates (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index downloads_template_idx on public.downloads (template_id, created_at desc);
create index downloads_user_idx on public.downloads (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 6. WEBHOOK EVENTS  (stops the same payment being processed twice)
-- ---------------------------------------------------------------------
create table public.webhook_events (
  id           text primary key,          -- the "webhook-id" header
  type         text not null,
  payload      jsonb not null,
  received_at  timestamptz not null default now(),
  processed_at timestamptz,
  error        text
);

-- ---------------------------------------------------------------------
-- 7. HELPER FUNCTIONS (only the server, using the service key, may call these)
-- ---------------------------------------------------------------------

-- Does this user own (or get for free) this template?
create or replace function public.has_access(p_user uuid, p_template uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select
    exists (select 1 from public.templates t
            where t.id = p_template and t.is_free and t.is_published)
    or exists (select 1 from public.orders o
               join public.templates t on t.id = o.template_id
               where o.user_id = p_user
                 and o.status = 'paid'
                 and (o.template_id = p_template or t.kind = 'bundle'));
$$;

-- Mark an order as paid exactly once. Returns true only the first time.
create or replace function public.mark_order_paid(
  p_order uuid, p_payment_id text, p_paid_amount int, p_paid_currency text
)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_template uuid;
begin
  update public.orders
     set status = 'paid',
         payment_id = coalesce(p_payment_id, payment_id),
         paid_amount = p_paid_amount,
         paid_currency = p_paid_currency,
         paid_at = now(),
         updated_at = now()
   where id = p_order and status in ('pending', 'failed', 'cancelled')
  returning template_id into v_template;

  if v_template is null then
    return false;
  end if;

  update public.templates set purchase_count = purchase_count + 1 where id = v_template;
  return true;
end;
$$;

-- Record a download and bump the counter.
create or replace function public.record_download(p_user uuid, p_template uuid)
returns void
language sql security definer
set search_path = public
as $$
  insert into public.downloads (user_id, template_id) values (p_user, p_template);
  update public.templates set download_count = download_count + 1 where id = p_template;
$$;

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger templates_touch before update on public.templates
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- Stop anyone except the server from calling the sensitive helpers.
revoke execute on function public.has_access(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_paid(uuid, text, int, text) from public, anon, authenticated;
revoke execute on function public.record_download(uuid, uuid) from public, anon, authenticated;
grant execute on function public.has_access(uuid, uuid) to service_role;
grant execute on function public.mark_order_paid(uuid, text, int, text) to service_role;
grant execute on function public.record_download(uuid, uuid) to service_role;

-- ---------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY  (who can read/write what)
-- ---------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.templates      enable row level security;
alter table public.template_files enable row level security;
alter table public.orders         enable row level security;
alter table public.downloads      enable row level security;
alter table public.webhook_events enable row level security;

-- Visitors who are not signed in can only ever read.
revoke insert, update, delete on all tables in schema public from anon;

-- Profiles: you see and edit your own; admins see everyone.
create policy "Read own profile or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "Update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- Customers may only change these two columns (never their own role).
revoke update on public.profiles from authenticated;
grant update (full_name, marketing_opt_in) on public.profiles to authenticated;

-- Categories: everyone reads, admins write.
create policy "Anyone reads categories" on public.categories
  for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Templates: everyone reads published ones, admins read and write all.
create policy "Anyone reads published templates" on public.templates
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins insert templates" on public.templates
  for insert to authenticated with check (public.is_admin());
create policy "Admins update templates" on public.templates
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete templates" on public.templates
  for delete to authenticated using (public.is_admin());

-- Template files: admins only.
create policy "Admins manage template files" on public.template_files
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders: you see your own; admins see all. Nobody writes from the browser —
-- only the server (service key) creates and updates orders.
create policy "Read own orders or admin" on public.orders
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
revoke insert, update, delete on public.orders from authenticated;

-- Downloads: you see your own; admins see all.
create policy "Read own downloads or admin" on public.downloads
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
revoke insert, update, delete on public.downloads from authenticated;

-- Webhook events: no browser access at all (no policies).
revoke all on public.webhook_events from anon, authenticated;

-- ---------------------------------------------------------------------
-- 9. FILE STORAGE
--    previews       → public bucket for cover & gallery images
--    template-files → PRIVATE bucket for the files people pay for
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('previews', 'previews', true, 10485760,
   array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']),
  ('template-files', 'template-files', false, 52428800, null)
on conflict (id) do nothing;

create policy "Admins manage preview images" on storage.objects
  for all to authenticated
  using (bucket_id = 'previews' and public.is_admin())
  with check (bucket_id = 'previews' and public.is_admin());

create policy "Admins manage template files" on storage.objects
  for all to authenticated
  using (bucket_id = 'template-files' and public.is_admin())
  with check (bucket_id = 'template-files' and public.is_admin());
-- Customers never read template-files directly: the server checks their
-- purchase and hands out a download link that expires after 60 seconds.
