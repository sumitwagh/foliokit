import "server-only";
import DodoPayments from "dodopayments";

/** True when the Dodo Payments keys are present. */
export function isPaymentsConfigured() {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_WEBHOOK_KEY);
}

/**
 * Server-only Dodo Payments client.
 * DODO_PAYMENTS_ENVIRONMENT = "test_mode" while testing, "live_mode" when you launch.
 */
export function dodo() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) throw new Error("DODO_PAYMENTS_API_KEY is not set");
  // DODO_PAYMENTS_BASE_URL is only for automated tests; leave it unset.
  if (process.env.DODO_PAYMENTS_BASE_URL) return new DodoPayments({ bearerToken: apiKey, baseURL: process.env.DODO_PAYMENTS_BASE_URL });
  return new DodoPayments({
    bearerToken: apiKey,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
}
