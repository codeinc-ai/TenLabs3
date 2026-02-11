// src/app/api/voices/noiz/route.ts
import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getVoices } from "@/lib/providers/noiz/noizVoiceService";
import { NOIZ_DEFAULT_VOICES } from "@/constants/noiz";

/**
 * ==========================================
 * GET /api/voices/noiz
 * ==========================================
 * Returns Noiz AI voices with optional filters.
 */
export async function GET(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voices");
    scope.setTag("provider", "noiz");

    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }
      scope.setUser({ id: user.id });

      const noizKey = process.env.NOIZ_API_KEY;
      if (!noizKey) {
        const fallback = NOIZ_DEFAULT_VOICES.map((v) => ({
          voiceId: v.id,
          name: v.name,
          category: v.category,
          provider: "noiz",
        }));
        return NextResponse.json(
          { success: true, voices: fallback },
          { status: 200 }
        );
      }

      const { searchParams } = new URL(req.url);
      const voiceType =
        (searchParams.get("voice_type") as "custom" | "built-in") ||
        "built-in";
      const keyword = searchParams.get("keyword") || undefined;
      const skip = searchParams.get("skip")
        ? parseInt(searchParams.get("skip")!)
        : undefined;
      const limit = searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined;

      const voices = await getVoices(voiceType, keyword, skip, limit);
      return NextResponse.json(
        { success: true, voices },
        { status: 200 }
      );
    } catch (error: unknown) {
      Sentry.captureException(error);
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  });
}
