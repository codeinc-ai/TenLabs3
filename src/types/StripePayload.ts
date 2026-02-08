// src/types/StripePayload.ts

/**
 * Represents minimal Stripe subscription/billing info
 */
export interface StripePayload {
  userId: string;         // User making the payment
  plan: "free" | "starter" | "creator" | "pro"; // Plan being purchased
  amount: number;         // Amount in cents
  currency: string;       // Currency code, e.g., 'usd'
  stripeSessionId?: string; // Optional: Stripe checkout session
}
