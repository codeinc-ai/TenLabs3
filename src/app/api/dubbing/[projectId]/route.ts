// src/app/api/dubbing/[projectId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { getDubbing } from "@/lib/services/dubbingService";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

/**
 * ==========================================
 * GET /api/dubbing/[projectId]
 * ==========================================
 * Returns metadata for a specific dubbing project.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dubbing = await getDubbing(projectId, userId);

    return NextResponse.json({
      id: dubbing._id,
      dubbingId: dubbing.dubbingId,
      projectName: dubbing.projectName,
      originalFileName: dubbing.originalFileName,
      sourceLanguage: dubbing.sourceLanguage,
      targetLanguages: dubbing.targetLanguages,
      status: dubbing.status,
      duration: dubbing.duration,
      errorMessage: dubbing.errorMessage,
      createdAt: dubbing.createdAt,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("route", "api/dubbing/[projectId]");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Dubbing project not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
