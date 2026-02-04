// src/app/api/voices/clone/professional/[voiceId]/verification/captcha/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getPVCCaptcha, verifyPVCCaptcha } from "@/lib/services/voiceCloningService";

interface RouteParams {
  params: Promise<{ voiceId: string }>;
}

// GET - Get CAPTCHA image
export async function GET(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/verification/captcha");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { voiceId } = await params;

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);
      scope.setExtra("voiceId", voiceId);

      const captcha = await getPVCCaptcha(userId, voiceId);

      return NextResponse.json({ success: true, data: captcha }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}

// POST - Submit CAPTCHA verification recording
export async function POST(req: NextRequest, { params }: RouteParams) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "pvc");
    scope.setTag("route", "api/voices/clone/professional/[voiceId]/verification/captcha");

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
      const recording = formData.get("recording");

      if (!recording || !(recording instanceof File)) {
        return NextResponse.json(
          { error: "Missing required field: recording" },
          { status: 400 }
        );
      }

      await verifyPVCCaptcha(userId, voiceId, recording);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
