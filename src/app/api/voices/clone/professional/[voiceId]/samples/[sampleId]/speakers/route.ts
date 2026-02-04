// src/app/api/voices/clone/professional/[voiceId]/samples/[sampleId]/speakers/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  triggerSpeakerSeparation,
  getSpeakerSeparationStatus,
} from "@/lib/services/voiceCloningService";

interface RouteParams {
  params: Promise<{ voiceId: string; sampleId: string }>;
}

// POST - Trigger speaker separation
export async function POST(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/samples/[sampleId]/speakers");

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

      await triggerSpeakerSeparation(userId, voiceId, sampleId);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}

// GET - Check speaker separation status
export async function GET(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/samples/[sampleId]/speakers");

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

      const status = await getSpeakerSeparationStatus(userId, voiceId, sampleId);

      return NextResponse.json({ success: true, data: status }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
