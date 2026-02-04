// src/app/api/voice-isolator/[isolationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { getVoiceIsolation } from "@/lib/services/voiceIsolatorService";

interface RouteParams {
  params: Promise<{ isolationId: string }>;
}

/**
 * ==========================================
 * GET /api/voice-isolator/[isolationId]
 * ==========================================
 * Returns metadata for a specific voice isolation.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { isolationId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isolation = await getVoiceIsolation(isolationId, userId);

    return NextResponse.json({
      id: isolation._id,
      originalFileName: isolation.originalFileName,
      duration: isolation.duration,
      audioUrl: `/api/voice-isolator/${isolationId}/audio`,
      createdAt: isolation.createdAt,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-isolator");
      scope.setTag("route", "api/voice-isolator/[isolationId]");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Voice isolation not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
