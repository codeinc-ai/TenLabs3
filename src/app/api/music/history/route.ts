// src/app/api/music/history/route.ts
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { getMusicGenerations } from "@/lib/services/musicService";

/**
 * ==========================================
 * GET /api/music/history
 * ==========================================
 * Returns paginated list of the authenticated user's music generations.
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

    const result = await getMusicGenerations(userId, page, limit);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "music");
      scope.setTag("route", "api/music/history");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to fetch music history" },
      { status: 500 }
    );
  }
}
