export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export type Template = {
  id: string;
  slug: string;
  kind: "template" | "bundle";
  name: string;
  tagline: string;
  description: string;
  category_id: string | null;
  tags: string[];
  price_cents: number;
  currency: string;
  is_free: boolean;
  is_published: boolean;
  is_featured: boolean;
  features: string[];
  included: string[];
  tech_stack: string[];
  pages: string[];
  preview_url: string | null;
  accent_color: string;
  accent_ink: string;
  display_font: string | null;
  cover_path: string | null;
  gallery_paths: string[];
  version: string;
  dodo_product_id: string | null;
  purchase_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type Order = {
  id: string;
  user_id: string | null;
  template_id: string;
  status: OrderStatus;
  amount_cents: number;
  currency: string;
  paid_amount: number | null;
  paid_currency: string | null;
  customer_email: string;
  provider: string;
  checkout_session_id: string | null;
  payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  template?: Pick<Template, "id" | "name" | "slug" | "kind" | "cover_path" | "accent_color"> | null;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "admin";
  marketing_opt_in: boolean;
  created_at: string;
};
