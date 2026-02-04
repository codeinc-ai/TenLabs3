// src/app/api/billing/invoices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getInvoices } from "@/lib/services/billingService";

/**
 * GET /api/billing/invoices
 * Returns paginated list of invoices.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getInvoices(userId, { limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
