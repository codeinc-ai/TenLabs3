// src/app/api/sfx/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { generateSoundEffect, getSoundEffects } from "@/lib/services/sfxService";

/**
 * ==========================================
 * GET /api/sfx
 * ==========================================
 * Lists user's sound effects.
 *
 * Query params:
 * - page (default: 1)
 * - limit (default: 10, max: 50)
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

    const result = await getSoundEffects(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("route", "api/sfx");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch sound effects" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/sfx
 * ==========================================
 * Generates a new sound effect.
 *
 * Body (JSON):
 * - text: string (required) - Description of the sound effect
 * - duration_seconds: number (optional) - Duration in seconds (0.5-22)
 * - prompt_influence: number (optional) - Influence of prompt (0-1)
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "sfx");
    scope.setTag("service", "api");
    scope.setTag("route", "api/sfx");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const body = await req.json().catch(() => ({}));
      const text = body.text;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Missing required field: text" }, { status: 400 });
      }

      const durationSeconds =
        body.duration_seconds !== undefined
          ? parseFloat(body.duration_seconds)
          : body.durationSeconds !== undefined
            ? parseFloat(body.durationSeconds)
            : undefined;

      const promptInfluence =
        body.prompt_influence !== undefined
          ? parseFloat(body.prompt_influence)
          : body.promptInfluence !== undefined
            ? parseFloat(body.promptInfluence)
            : undefined;

      const result = await generateSoundEffect({
        userId,
        text,
        durationSeconds: isNaN(durationSeconds as number) ? undefined : durationSeconds,
        promptInfluence: isNaN(promptInfluence as number) ? undefined : promptInfluence,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
