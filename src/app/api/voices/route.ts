// src/app/api/voices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getVoices } from "@/lib/services/voiceService";

/**
 * ==========================================
 * GET /api/voices
 * ==========================================
 * Returns paginated list of voices with filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
      search: searchParams.get("search") || "",
      gender: searchParams.get("gender") || "",
      category: searchParams.get("category") || "",
      featured: searchParams.get("featured") === "true",
      defaultOnly: searchParams.get("defaultOnly") === "true",
      sortBy: (searchParams.get("sortBy") || "popular") as "popular" | "newest" | "name",
    };

    const result = await getVoices(userId, options);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
  }
}
