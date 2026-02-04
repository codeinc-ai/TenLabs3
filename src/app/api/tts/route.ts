// src/app/api/tts/route.ts
import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/services/ttsService";
import { TTSRequest } from "@/types/TTSRequest";

/**
 * ==========================================
 * TTS API Route
 * ==========================================
 * Handles POST requests to generate TTS audio.
 * Endpoint: /api/tts
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "tts");
    scope.setTag("service", "api");

    try {
      // 1️⃣ Authenticate user
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: user.id });
      scope.setTag("userId", user.id);

      // 2️⃣ Parse request body
      const body = (await req.json()) as TTSRequest;

      // 3️⃣ Validate required fields
      if (!body.text) {
        return NextResponse.json(
          { error: "Missing required field: text" },
          { status: 400 }
        );
      }

      // 4️⃣ Call the ElevenLabs TTS service
      const result = await generateSpeech({ ...body, userId: user.id });

      // 5️⃣ Return success response
      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      // Capture server-side API errors for production visibility.
      // IMPORTANT: Do NOT attach raw request bodies (text) here.
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";

      // 6️⃣ Return error response
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  });
}
