// src/app/api/library/[id]/favorite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { toggleFavorite } from "@/lib/services/libraryService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * ==========================================
 * POST /api/library/[id]/favorite
 * ==========================================
 * Toggle favorite status for a generation.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await toggleFavorite(userId, id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, isFavorite: result.isFavorite });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "library");
      scope.setTag("route", "api/library/[id]/favorite");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 }
    );
  }
}
