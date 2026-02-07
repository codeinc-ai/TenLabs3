// src/app/api/music/[generationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { getMusicGenerationAudioSource } from "@/lib/services/musicService";
import { downloadBackblazeFile } from "@/lib/services/backblazeService";

interface RouteParams {
  params: Promise<{ generationId: string }>;
}

/**
 * ==========================================
 * GET /api/music/[generationId]
 * ==========================================
 * Proxies music audio file from Backblaze B2 for authenticated users.
 * Verifies the user owns the generation before streaming.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { generationId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const generation = await getMusicGenerationAudioSource(userId, generationId);

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    const file = await downloadBackblazeFile({ fileName: generation.audioPath });

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
      scope.setTag("feature", "music");
      scope.setTag("route", "api/music/[generationId]");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 500 }
    );
  }
}
