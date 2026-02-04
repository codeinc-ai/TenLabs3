// src/app/api/voices/design/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { designVoice } from "@/lib/services/voiceCloningService";

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voice-design");
    scope.setTag("route", "api/voices/design");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const body = await req.json();
      const { voiceName, voiceDescription, generatedVoiceId } = body;

      if (!voiceName || typeof voiceName !== "string") {
        return NextResponse.json(
          { error: "Missing required field: voiceName" },
          { status: 400 }
        );
      }

      if (!voiceDescription || typeof voiceDescription !== "string") {
        return NextResponse.json(
          { error: "Missing required field: voiceDescription" },
          { status: 400 }
        );
      }

      if (!generatedVoiceId || typeof generatedVoiceId !== "string") {
        return NextResponse.json(
          { error: "Missing required field: generatedVoiceId" },
          { status: 400 }
        );
      }

      const result = await designVoice(
        userId,
        voiceName,
        voiceDescription,
        generatedVoiceId
      );

      return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("limit reached") ? 403 : 500;

      return NextResponse.json({ success: false, error: message }, { status });
    }
  });
}
