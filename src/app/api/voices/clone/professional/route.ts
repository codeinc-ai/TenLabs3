// src/app/api/voices/clone/professional/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createPVCVoice } from "@/lib/services/voiceCloningService";

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const body = await req.json();
      const { name, language, description } = body;

      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { error: "Missing required field: name" },
          { status: 400 }
        );
      }

      if (!language || typeof language !== "string") {
        return NextResponse.json(
          { error: "Missing required field: language" },
          { status: 400 }
        );
      }

      const result = await createPVCVoice(
        userId,
        name,
        language,
        description || undefined
      );

      return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("requires a Pro plan") ? 403 : 
                     message.includes("limit reached") ? 403 : 500;

      return NextResponse.json({ success: false, error: message }, { status });
    }
  });
}
