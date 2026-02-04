// src/app/api/generations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getGenerations } from "@/lib/services/generationService";

/**
 * ==========================================
 * GET /api/generations
 * ==========================================
 * Returns paginated list of user's generations.
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    const result = await getGenerations(userId, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("route", "api/generations");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}
