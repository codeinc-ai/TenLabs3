// src/app/api/music/generate/route.ts
import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { generateMusic } from "@/lib/services/musicService";

/**
 * ==========================================
 * POST /api/music/generate
 * ==========================================
 * Generates music using the ElevenLabs Music API.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    const provider = body.provider ?? "elevenlabs";

    const result = await generateMusic({
      userId: user.id,
      prompt: body.prompt,
      durationMs: body.durationMs,
      forceInstrumental: body.forceInstrumental,
      provider,
      lyrics: body.lyrics,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "music");
      scope.setTag("route", "api/music/generate");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
