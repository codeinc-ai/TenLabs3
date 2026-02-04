// src/app/api/stt/[transcriptionId]/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { downloadBackblazeFile } from "@/lib/services/backblazeService";
import { getTranscriptionAudioSource } from "@/lib/services/transcriptionService";

interface RouteParams {
  params: Promise<{ transcriptionId: string }>;
}

/**
 * ==========================================
 * GET /api/stt/[transcriptionId]/audio
 * ==========================================
 * Proxies the original uploaded audio file from Backblaze B2.
 * Verifies the authenticated user owns the transcription.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { transcriptionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = await getTranscriptionAudioSource(userId, transcriptionId);

    if (!source) {
      return NextResponse.json({ error: "Transcription not found" }, { status: 404 });
    }

    const file = await downloadBackblazeFile({ fileName: source.audioPath });

    const uint8Array = new Uint8Array(file.buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": String(file.contentLength),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("route", "api/stt/[transcriptionId]/audio");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 });
  }
}
