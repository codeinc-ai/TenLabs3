// src/app/api/stt/token/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

/**
 * ==========================================
 * GET /api/stt/token
 * ==========================================
 * Creates a single-use token for realtime transcription.
 * This token is used client-side to connect to the ElevenLabs
 * WebSocket API without exposing the API key.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // Request a single-use token from ElevenLabs
    // Endpoint: POST /v1/single-use-token/:token_type
    const response = await fetch(
      "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs token API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      token: data.token,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("route", "api/stt/token");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Failed to create token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
