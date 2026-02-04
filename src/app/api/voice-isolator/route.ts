// src/app/api/voice-isolator/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { isolateVoice, getVoiceIsolations } from "@/lib/services/voiceIsolatorService";

/**
 * ==========================================
 * GET /api/voice-isolator
 * ==========================================
 * Lists user's voice isolations.
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

    const result = await getVoiceIsolations(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-isolator");
      scope.setTag("route", "api/voice-isolator");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch voice isolations" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/voice-isolator
 * ==========================================
 * Accepts multipart/form-data:
 * - file: File (required)
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voice-isolator");
    scope.setTag("service", "api");
    scope.setTag("route", "api/voice-isolator");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const form = await req.formData();
      const file = form.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing required field: file" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const result = await isolateVoice({
        userId,
        audioBuffer,
        fileName: file.name,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
