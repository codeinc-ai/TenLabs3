// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getDashboardStats } from "@/lib/services/dashboardService";

/**
 * ==========================================
 * GET /api/dashboard
 * ==========================================
 * Returns dashboard statistics for the authenticated user.
 *
 * Response:
 * - 200: Dashboard stats object
 * - 401: Unauthorized (no auth)
 * - 500: Server error
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dashboard");
      scope.setTag("route", "api/dashboard");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
