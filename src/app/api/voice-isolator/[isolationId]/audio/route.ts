// src/app/api/voice-isolator/[isolationId]/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { downloadBackblazeFile } from "@/lib/services/backblazeService";
import { getVoiceIsolation } from "@/lib/services/voiceIsolatorService";

interface RouteParams {
  params: Promise<{ isolationId: string }>;
}

/**
 * ==========================================
 * GET /api/voice-isolator/[isolationId]/audio
 * ==========================================
 * Proxies the isolated audio file from Backblaze B2.
 * Verifies the authenticated user owns the isolation.
 *
 * Query params:
 * - type: "isolated" (default) | "original" - which audio to download
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { isolationId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "isolated";

    const isolation = await getVoiceIsolation(isolationId, userId);

    if (!isolation) {
      return NextResponse.json({ error: "Voice isolation not found" }, { status: 404 });
    }

    const audioPath = type === "original" 
      ? isolation.originalAudioPath 
      : isolation.isolatedAudioPath;

    const file = await downloadBackblazeFile({ fileName: audioPath });

    const uint8Array = new Uint8Array(file.buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": String(file.contentLength),
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${isolation.originalFileName.replace(/\.[^/.]+$/, "")}_${type}.mp3"`,
      },
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-isolator");
      scope.setTag("route", "api/voice-isolator/[isolationId]/audio");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Voice isolation not found" ? 404 : 500;

    return NextResponse.json({ error: "Failed to fetch audio" }, { status });
  }
}
