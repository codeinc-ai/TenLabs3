// src/app/api/voices/clone/professional/[voiceId]/samples/[sampleId]/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { selectSpeaker } from "@/lib/services/voiceCloningService";

interface RouteParams {
  params: Promise<{ voiceId: string; sampleId: string }>;
}

// PATCH - Select speaker(s) for a sample
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/samples/[sampleId]");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { voiceId, sampleId } = await params;

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("sampleId", sampleId);

      const body = await req.json();
      const { selectedSpeakerIds } = body;

      if (!selectedSpeakerIds || !Array.isArray(selectedSpeakerIds) || selectedSpeakerIds.length === 0) {
        return NextResponse.json(
          { error: "Missing required field: selectedSpeakerIds" },
          { status: 400 }
        );
      }

      await selectSpeaker(userId, voiceId, sampleId, selectedSpeakerIds);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
