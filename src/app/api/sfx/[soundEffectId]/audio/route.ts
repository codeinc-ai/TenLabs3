// src/app/api/sfx/[soundEffectId]/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { downloadBackblazeFile } from "@/lib/services/backblazeService";
import { getSoundEffectAudioSource } from "@/lib/services/sfxService";

interface RouteParams {
  params: Promise<{ soundEffectId: string }>;
}

/**
 * ==========================================
 * GET /api/sfx/[soundEffectId]/audio
 * ==========================================
 * Proxies the generated sound effect audio from Backblaze B2.
 * Verifies the authenticated user owns the sound effect.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { soundEffectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = await getSoundEffectAudioSource(userId, soundEffectId);

    if (!source) {
      return NextResponse.json({ error: "Sound effect not found" }, { status: 404 });
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
      scope.setTag("feature", "sfx");
      scope.setTag("route", "api/sfx/[soundEffectId]/audio");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 });
  }
}
