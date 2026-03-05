// src/lib/services/billingService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PLANS, BILLING_PLANS } from "@/constants";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";
import { polar } from "@/lib/polar";

/**
 * ==========================================
 * Subscription Info Interface
 * ==========================================
 */
export interface SubscriptionInfo {
  plan: "free" | "starter" | "creator" | "pro";
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
  appliedCoupon?: string;
  planExpiresAt?: string;
  discountPercent?: number;
  polarSubscriptionId?: string;
  polarCustomerId?: string;
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

    const plan = (user.plan || "free") as keyof typeof PLANS;
    const planLimits = PLANS[plan];
    const planDetails = BILLING_PLANS[plan];

    // Try to get live subscription data from Polar
    let periodStart = new Date();
    let periodEnd = new Date();
    let cancelAtPeriodEnd = false;
    let interval: "month" | "year" = "month";
    let priceAmount = planDetails.price.monthly * 100;

    if (user.polarSubscriptionId) {
      try {
        const polarSub = await polar.subscriptions.get({
          id: user.polarSubscriptionId,
        });
        periodStart = polarSub.currentPeriodStart;
        periodEnd = polarSub.currentPeriodEnd ? polarSub.currentPeriodEnd : periodEnd;
        cancelAtPeriodEnd = polarSub.cancelAtPeriodEnd;
        interval = polarSub.recurringInterval === "year" ? "year" : "month";
        priceAmount = polarSub.amount;
      } catch {
        // Fall back to calculated dates
        periodStart.setDate(1);
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    } else {
      periodStart.setDate(1);
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    return {
      plan,
      status: (user.polarSubscriptionStatus === "canceled" ? "canceled" : "active") as SubscriptionInfo["status"],
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd,
      usage: {
        charactersUsed: user.usage?.charactersUsed || 0,
        charactersLimit: planLimits.maxChars,
        generationsUsed: user.usage?.generationsUsed || 0,
        generationsLimit: planLimits.maxGenerations,
      },
      price: {
        amount: priceAmount,
        currency: "usd",
        interval,
      },
      appliedCoupon: user.appliedCoupon || undefined,
      planExpiresAt: user.planExpiresAt ? new Date(user.planExpiresAt).toISOString() : undefined,
      discountPercent: user.discountPercent || undefined,
      polarSubscriptionId: user.polarSubscriptionId || undefined,
      polarCustomerId: user.polarCustomerId || undefined,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[billingService] Failed to get subscription:", error);
    return defaultInfo;
  }
}

/**
 * ==========================================
 * Get Invoices from Polar
 * ==========================================
 */
export async function getInvoices(
  clerkId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ invoices: Invoice[]; total: number }> {
  try {
    await connectToDB();
    const user = await User.findOne({ clerkId });
    if (!user?.polarCustomerId) {
      return { invoices: [], total: 0 };
    }

    const limit = options.limit || 10;
    const page = Math.floor((options.offset || 0) / limit) + 1;

    const orders = await polar.orders.list({
      customerId: user.polarCustomerId,
      limit,
      page,
    });

    const invoices: Invoice[] = orders.result.items.map((order) => ({
      id: order.id,
      date: order.createdAt.toISOString(),
      amount: order.totalAmount,
      currency: order.currency,
      status: "paid" as const,
      description: order.product?.name || "Subscription",
    }));

    return {
      invoices,
      total: orders.result.pagination.totalCount,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[billingService] Failed to get invoices:", error);
    return { invoices: [], total: 0 };
  }
}

/**
 * ==========================================
 * Get Payment Methods
 * ==========================================
 * Payment methods are managed by Polar's customer portal.
 */
export async function getPaymentMethods(clerkId: string): Promise<PaymentMethod[]> {
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

  const nextInvoice = subscription.plan !== "free"
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
 * Upgrade Plan via Polar Checkout
 * ==========================================
 * Creates a Polar checkout session and returns the URL.
 */
export async function createCheckoutSession(
  clerkId: string,
  newPlan: "starter" | "creator" | "pro"
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  const productIdMap: Record<string, string | undefined> = {
    starter: process.env.POLAR_STARTER_PRODUCT_ID,
    creator: process.env.POLAR_CREATOR_PRODUCT_ID,
    pro: process.env.POLAR_PRO_PRODUCT_ID,
  };

  const productId = productIdMap[newPlan];
  if (!productId) {
    return { success: false, error: "Product not configured for this plan" };
  }

  try {
    await connectToDB();
    const user = await User.findOne({ clerkId });

    const checkout = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: clerkId,
      ...(user?.email ? { customerEmail: user.email } : {}),
      ...(user?.name ? { customerName: user.name } : {}),
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/billing?checkout=success&checkout_id={CHECKOUT_ID}`,
    });

    return { success: true, checkoutUrl: checkout.url };
  } catch (error: unknown) {
    Sentry.captureException(error);
    let detail = "Failed to create checkout session";
    if (error instanceof Error) {
      detail = error.message;
    }
    // Log Polar SDK error details
    const sdkError = error as { statusCode?: number; body?: string };
    console.error("[billingService] Checkout error:", detail, sdkError.statusCode, sdkError.body);
    return { success: false, error: detail };
  }
}

/**
 * ==========================================
 * Cancel Subscription via Polar
 * ==========================================
 */
export async function cancelSubscription(
  clerkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();
    const user = await User.findOne({ clerkId });

    if (!user?.polarSubscriptionId) {
      return { success: false, error: "No active subscription found" };
    }

    await polar.subscriptions.update({
      id: user.polarSubscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      },
    });

    await User.updateOne(
      { clerkId },
      { $set: { polarSubscriptionStatus: "canceled" } }
    );

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}
