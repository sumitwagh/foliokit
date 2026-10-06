import "server-only";
import { dodo, isPaymentsConfigured } from "@/lib/dodo";

/**
 * Creates or updates the matching product in Dodo Payments, so the price
 * customers are charged always equals the price on your site.
 * Returns the Dodo product id.
 */
export async function syncDodoProduct(t: { name: string; tagline: string; price_cents: number; dodo_product_id: string | null }) {
  if (!isPaymentsConfigured()) throw new Error("Add your Dodo Payments keys first (see SETUP.md).");
  const client = dodo();
  const price = {
    type: "one_time_price" as const,
    price: t.price_cents,
    currency: "USD" as const,
    discount: 0,
    purchasing_power_parity: false,
    tax_inclusive: true,
  };
  if (t.dodo_product_id) {
    try {
      await client.products.update(t.dodo_product_id, { name: t.name, description: t.tagline, price });
      return t.dodo_product_id;
    } catch (error) {
      // Test-mode products don't exist in live mode (and vice versa): make a new one.
      const status = (error as { status?: number }).status;
      if (status !== 404 && status !== 422) throw error;
    }
  }
  const product = await client.products.create({ name: t.name, description: t.tagline, price, tax_category: "digital_products" });
  return product.product_id;
}
