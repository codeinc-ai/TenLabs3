// src/app/api/dubbing/[projectId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { checkDubbingStatus } from "@/lib/services/dubbingService";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

/**
 * ==========================================
 * GET /api/dubbing/[projectId]/status
 * ==========================================
 * Checks the status of a dubbing project from ElevenLabs.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await checkDubbingStatus(projectId, userId);

    return NextResponse.json(status);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("route", "api/dubbing/[projectId]/status");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const statusCode = message === "Dubbing project not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
