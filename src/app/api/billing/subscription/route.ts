// src/app/api/billing/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import {
  getSubscriptionInfo,
  createCheckoutSession,
  cancelSubscription,
} from "@/lib/services/billingService";

/**
 * GET /api/billing/subscription
 * Returns current subscription info.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscriptionInfo(userId);
    return NextResponse.json(subscription);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing/subscription
 * Create a Polar checkout session for upgrading to a new plan.
 * Body: { plan: "starter" | "creator" | "pro" }
 * Returns: { success: true, checkoutUrl: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!["starter", "creator", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'starter', 'creator', or 'pro'." },
        { status: 400 }
      );
    }

    const result = await createCheckoutSession(userId, plan);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, checkoutUrl: result.checkoutUrl });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/billing/subscription
 * Cancel subscription via Polar.
 */
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await cancelSubscription(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Subscription canceled" });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
