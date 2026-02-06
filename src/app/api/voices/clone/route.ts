// src/app/api/voices/clone/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createInstantVoiceClone } from "@/lib/services/voiceCloningService";

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voice-cloning");
    scope.setTag("route", "api/voices/clone");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const formData = await req.formData();
      const name = formData.get("name");
      const description = formData.get("description") as string | null;
      const provider = (formData.get("provider") as string) || "elevenlabs";
      const files = formData.getAll("files");

      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { error: "Missing required field: name" },
          { status: 400 }
        );
      }

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

      scope.setTag("provider", provider);

      const result = await createInstantVoiceClone(
        userId,
        name,
        audioFiles,
        description || undefined,
        provider as "elevenlabs" | "minimax"
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
