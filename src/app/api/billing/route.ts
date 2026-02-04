// src/app/api/billing/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getBillingOverview } from "@/lib/services/billingService";

/**
 * GET /api/billing
 * Returns billing overview including subscription, invoices, and payment methods.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const overview = await getBillingOverview(userId);
    return NextResponse.json(overview);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch billing info" },
      { status: 500 }
    );
  }
}
