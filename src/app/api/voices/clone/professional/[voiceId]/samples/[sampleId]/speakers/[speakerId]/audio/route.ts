// src/app/api/voices/clone/professional/[voiceId]/samples/[sampleId]/speakers/[speakerId]/audio/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSpeakerAudio } from "@/lib/services/voiceCloningService";

interface RouteParams {
  params: Promise<{ voiceId: string; sampleId: string; speakerId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/samples/[sampleId]/speakers/[speakerId]/audio");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { voiceId, sampleId, speakerId } = await params;

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("sampleId", sampleId);
      scope.setExtra("speakerId", speakerId);

      const audio = await getSpeakerAudio(userId, voiceId, sampleId, speakerId);

      return NextResponse.json({ success: true, data: audio }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
