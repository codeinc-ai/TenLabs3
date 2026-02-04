// src/app/api/voices/clone/professional/[voiceId]/status/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getPVCTrainingStatus, savePVCVoiceToDb } from "@/lib/services/voiceCloningService";

interface RouteParams {
  params: Promise<{ voiceId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/status");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { voiceId } = await params;

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);
      scope.setExtra("voiceId", voiceId);

      const status = await getPVCTrainingStatus(userId, voiceId);

      // Check query params for voice name/description to save if training is complete
      const url = new URL(req.url);
      const name = url.searchParams.get("name");
      const description = url.searchParams.get("description");

      // If training is complete and we have a name, save to DB
      if (status.state === "fine_tuned" && name) {
        try {
          await savePVCVoiceToDb(userId, voiceId, name, description || undefined);
        } catch (saveError) {
          // Log but don't fail - voice might already be saved
          Sentry.captureException(saveError);
        }
      }

      return NextResponse.json({ success: true, data: status }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
