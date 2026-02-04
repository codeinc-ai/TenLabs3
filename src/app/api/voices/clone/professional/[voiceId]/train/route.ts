// src/app/api/voices/clone/professional/[voiceId]/train/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { trainPVC } from "@/lib/services/voiceCloningService";
import { PVC_CONFIG } from "@/constants";

interface RouteParams {
  params: Promise<{ voiceId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/train");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { voiceId } = await params;

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);
      scope.setExtra("voiceId", voiceId);

      let modelId = PVC_CONFIG.trainingModel;

      // Check if custom model ID provided in body
      try {
        const body = await req.json();
        if (body.modelId) {
          modelId = body.modelId;
        }
      } catch {
        // Body might be empty, use default
      }

      await trainPVC(userId, voiceId, modelId);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
