// src/app/api/billing/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import {
  getSubscriptionInfo,
  upgradePlan,
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
 * Upgrade to a new plan.
 * Body: { plan: "pro" }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan. Only 'pro' upgrade is available." },
        { status: 400 }
      );
    }

    const result = await upgradePlan(userId, plan);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Plan upgraded successfully" });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to upgrade plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/billing/subscription
 * Cancel subscription.
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
