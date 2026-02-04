// src/app/api/voices/clone/professional/[voiceId]/samples/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { uploadPVCSamples, triggerSpeakerSeparation } from "@/lib/services/voiceCloningService";

interface RouteParams {
  params: Promise<{ voiceId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/samples");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { voiceId } = await params;

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);
      scope.setExtra("voiceId", voiceId);

      const formData = await req.formData();
      const files = formData.getAll("files");

      if (!files.length) {
        return NextResponse.json(
          { error: "Missing required field: files" },
          { status: 400 }
        );
      }

      const audioFiles = files.filter((f): f is File => f instanceof File);
      if (!audioFiles.length) {
        return NextResponse.json(
          { error: "No valid audio files provided" },
          { status: 400 }
        );
      }

      // Upload samples
      const samples = await uploadPVCSamples(userId, voiceId, audioFiles);

      // Trigger speaker separation for each sample
      for (const sample of samples) {
        await triggerSpeakerSeparation(userId, voiceId, sample.sampleId);
      }

      return NextResponse.json({ success: true, data: { samples } }, { status: 201 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
