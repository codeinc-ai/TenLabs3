// src/app/api/billing/payment-methods/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getPaymentMethods } from "@/lib/services/billingService";

/**
 * GET /api/billing/payment-methods
 * Returns list of payment methods.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethods = await getPaymentMethods(userId);
    return NextResponse.json({ paymentMethods });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
