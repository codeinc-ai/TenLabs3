// src/app/api/voices/design/preview/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { generateVoiceDesignPreviews } from "@/lib/services/voiceCloningService";

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voice-design");
    scope.setTag("route", "api/voices/design/preview");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const body = await req.json();
      const { voiceDescription, sampleText } = body;

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

      const previews = await generateVoiceDesignPreviews(
        userId,
        voiceDescription,
        sampleText
      );

      return NextResponse.json({ success: true, data: previews }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
