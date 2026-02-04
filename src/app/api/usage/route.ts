// src/app/api/usage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getUsageData } from "@/lib/services/usageService";

/**
 * GET /api/usage
 * Returns complete usage data including summary, history, breakdown, and activity.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get days parameter (default 7)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7", 10);

    const usageData = await getUsageData(userId, days);
    return NextResponse.json(usageData);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
