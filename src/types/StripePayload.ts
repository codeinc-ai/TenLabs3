// src/types/StripePayload.ts

/**
 * Represents billing/checkout info for Polar.sh integration.
 * Kept for backward compatibility.
 */
export interface StripePayload {
  userId: string;         // User making the payment
  plan: "free" | "starter" | "creator" | "pro"; // Plan being purchased
  amount: number;         // Amount in cents
  currency: string;       // Currency code, e.g., 'usd'
  polarCheckoutId?: string; // Polar checkout session ID
}
