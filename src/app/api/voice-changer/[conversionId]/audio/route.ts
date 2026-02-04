// src/app/api/voice-changer/[conversionId]/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { downloadBackblazeFile } from "@/lib/services/backblazeService";
import { getVoiceConversion } from "@/lib/services/voiceChangerService";

interface RouteParams {
  params: Promise<{ conversionId: string }>;
}

/**
 * ==========================================
 * GET /api/voice-changer/[conversionId]/audio
 * ==========================================
 * Proxies the converted audio file from Backblaze B2.
 * Verifies the authenticated user owns the conversion.
 *
 * Query params:
 * - type: "converted" (default) | "original" - which audio to download
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { conversionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "converted";

    const conversion = await getVoiceConversion(conversionId, userId);

    if (!conversion) {
      return NextResponse.json({ error: "Voice conversion not found" }, { status: 404 });
    }

    const audioPath = type === "original" 
      ? conversion.originalAudioPath 
      : conversion.convertedAudioPath;

    const file = await downloadBackblazeFile({ fileName: audioPath });

    const uint8Array = new Uint8Array(file.buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": String(file.contentLength),
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${conversion.originalFileName.replace(/\.[^/.]+$/, "")}_${type}.mp3"`,
      },
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-changer");
      scope.setTag("route", "api/voice-changer/[conversionId]/audio");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Voice conversion not found" ? 404 : 500;

    return NextResponse.json({ error: "Failed to fetch audio" }, { status });
  }
}
