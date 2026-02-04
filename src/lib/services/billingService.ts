// src/lib/services/billingService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PLANS, BILLING_PLANS } from "@/constants";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Subscription Info Interface
 * ==========================================
 */
export interface SubscriptionInfo {
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    charactersUsed: number;
    charactersLimit: number;
    generationsUsed: number;
    generationsLimit: number;
  };
  price: {
    amount: number;
    currency: string;
    interval: "month" | "year";
  };
}

/**
 * ==========================================
 * Invoice Interface
 * ==========================================
 */
export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  description: string;
  pdfUrl?: string;
}

/**
 * ==========================================
 * Payment Method Interface
 * ==========================================
 */
export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

/**
 * ==========================================
 * Billing Overview Interface
 * ==========================================
 */
export interface BillingOverview {
  subscription: SubscriptionInfo;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  nextInvoice?: {
    date: string;
    amount: number;
    currency: string;
  };
}

// Note: Invoices and payment methods will come from Stripe when integrated.
// For now, these return empty arrays until Stripe is connected.

/**
 * ==========================================
 * Get Subscription Info
 * ==========================================
 */
export async function getSubscriptionInfo(
  clerkId: string
): Promise<SubscriptionInfo> {
  const defaultInfo: SubscriptionInfo = {
    plan: "free",
    status: "active",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    usage: {
      charactersUsed: 0,
      charactersLimit: PLANS.free.maxChars,
      generationsUsed: 0,
      generationsLimit: PLANS.free.maxGenerations,
    },
    price: {
      amount: 0,
      currency: "usd",
      interval: "month",
    },
  };

  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return defaultInfo;
  }

  try {
    await connectToDB();
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return defaultInfo;
    }

    const plan = user.plan || "free";
    const planLimits = PLANS[plan];
    const planDetails = BILLING_PLANS[plan];

    // Calculate period dates (mock: 30-day billing cycle)
    const periodStart = new Date();
    periodStart.setDate(1); // First of current month
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return {
      plan,
      status: "active",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      usage: {
        charactersUsed: user.usage?.charactersUsed || 0,
        charactersLimit: planLimits.maxChars,
        generationsUsed: user.usage?.generationsUsed || 0,
        generationsLimit: planLimits.maxGenerations,
      },
      price: {
        amount: planDetails.price.monthly * 100, // cents
        currency: "usd",
        interval: "month",
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[billingService] Failed to get subscription:", error);
    return defaultInfo;
  }
}

/**
 * ==========================================
 * Get Invoices
 * ==========================================
 * Returns invoices from Stripe (when integrated).
 * Currently returns empty array until Stripe is connected.
 */
export async function getInvoices(
  clerkId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ invoices: Invoice[]; total: number }> {
  // TODO: Implement Stripe invoice fetching
  // Parameters will be used when Stripe is integrated
  void clerkId;
  void options;
  return { invoices: [], total: 0 };
}

/**
 * ==========================================
 * Get Payment Methods
 * ==========================================
 * Returns payment methods from Stripe (when integrated).
 * Currently returns empty array until Stripe is connected.
 */
export async function getPaymentMethods(clerkId: string): Promise<PaymentMethod[]> {
  // TODO: Implement Stripe payment method fetching
  // Parameter will be used when Stripe is integrated
  void clerkId;
  return [];
}

/**
 * ==========================================
 * Get Billing Overview
 * ==========================================
 */
export async function getBillingOverview(
  clerkId: string
): Promise<BillingOverview> {
  const [subscription, invoicesData, paymentMethods] = await Promise.all([
    getSubscriptionInfo(clerkId),
    getInvoices(clerkId, { limit: 5 }),
    getPaymentMethods(clerkId),
  ]);

  // Calculate next invoice for pro users
  const nextInvoice = subscription.plan === "pro"
    ? {
        date: subscription.currentPeriodEnd,
        amount: subscription.price.amount,
        currency: subscription.price.currency,
      }
    : undefined;

  return {
    subscription,
    invoices: invoicesData.invoices,
    paymentMethods,
    nextInvoice,
  };
}

/**
 * ==========================================
 * Upgrade Plan (Mock)
 * ==========================================
 */
export async function upgradePlan(
  clerkId: string,
  newPlan: "pro"
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const result = await User.updateOne(
      { clerkId },
      { $set: { plan: newPlan } }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: "User not found" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: "Failed to upgrade plan" };
  }
}

/**
 * ==========================================
 * Cancel Subscription (Mock)
 * ==========================================
 */
export async function cancelSubscription(
  clerkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    // In production, this would set cancelAtPeriodEnd = true
    // For mock, we just downgrade to free
    const result = await User.updateOne(
      { clerkId },
      { $set: { plan: "free" } }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: "User not found" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}
