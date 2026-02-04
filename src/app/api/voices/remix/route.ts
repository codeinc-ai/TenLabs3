// src/app/api/voices/remix/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  generateVoiceRemixPreviews,
  remixVoice,
} from "@/lib/services/voiceCloningService";

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voice-remix");
    scope.setTag("route", "api/voices/remix");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const body = await req.json();
      const {
        voiceId,
        voiceName,
        voiceDescription,
        sampleText,
        generatedVoiceId,
      } = body;

      if (generatedVoiceId && voiceName) {
        if (!voiceDescription || typeof voiceDescription !== "string") {
          return NextResponse.json(
            { error: "Missing required field: voiceDescription" },
            { status: 400 }
          );
        }

        const result = await remixVoice(
          userId,
          voiceName,
          voiceDescription,
          generatedVoiceId
        );

        return NextResponse.json({ success: true, data: result }, { status: 201 });
      }

      if (!voiceId || typeof voiceId !== "string") {
        return NextResponse.json(
          { error: "Missing required field: voiceId" },
          { status: 400 }
        );
      }

      if (!voiceDescription || typeof voiceDescription !== "string") {
        return NextResponse.json(
          { error: "Missing required field: voiceDescription" },
          { status: 400 }
        );
      }

      if (!sampleText || typeof sampleText !== "string") {
        return NextResponse.json(
          { error: "Missing required field: sampleText" },
          { status: 400 }
        );
      }

      const previews = await generateVoiceRemixPreviews(
        userId,
        voiceId,
        voiceDescription,
        sampleText
      );

      return NextResponse.json({ success: true, data: previews }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("limit reached") ? 403 : 500;

      return NextResponse.json({ success: false, error: message }, { status });
    }
  });
}
