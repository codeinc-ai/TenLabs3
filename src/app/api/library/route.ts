// src/app/api/library/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getLibraryItems, bulkDeleteGenerations } from "@/lib/services/libraryService";

/**
 * ==========================================
 * GET /api/library
 * ==========================================
 * Returns paginated, filtered list of user's audio library.
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 50)
 * - search: Search text content
 * - voiceId: Filter by voice
 * - favorites: Show only favorites (true/false)
 * - sortBy: newest, oldest, longest, shortest
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const search = searchParams.get("search") || "";
    const voiceId = searchParams.get("voiceId") || "";
    const favorites = searchParams.get("favorites") === "true";
    const sortBy = (searchParams.get("sortBy") || "newest") as "newest" | "oldest" | "longest" | "shortest";

    const result = await getLibraryItems(userId, {
      page,
      limit,
      search,
      voiceId,
      favorites,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "library");
      scope.setTag("route", "api/library");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}

/**
 * ==========================================
 * DELETE /api/library
 * ==========================================
 * Bulk delete generations.
 *
 * Body: { ids: string[] }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const ids = body.ids as string[];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const result = await bulkDeleteGenerations(userId, ids);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "library");
      scope.setTag("route", "api/library");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
