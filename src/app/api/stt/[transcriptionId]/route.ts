// src/app/api/stt/[transcriptionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import {
  deleteTranscription,
  getTranscriptionById,
} from "@/lib/services/transcriptionService";

interface RouteParams {
  params: Promise<{ transcriptionId: string }>;
}

/**
 * ==========================================
 * GET /api/stt/[transcriptionId]
 * ==========================================
 * Returns a single transcription by ID.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { transcriptionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transcription = await getTranscriptionById(userId, transcriptionId);

    if (!transcription) {
      return NextResponse.json({ error: "Transcription not found" }, { status: 404 });
    }

    return NextResponse.json(transcription);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("route", "api/stt/[transcriptionId]");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch transcription" }, { status: 500 });
  }
}

/**
 * ==========================================
 * DELETE /api/stt/[transcriptionId]
 * ==========================================
 * Deletes a transcription and its uploaded audio.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { transcriptionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteTranscription(userId, transcriptionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("route", "api/stt/[transcriptionId]");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to delete transcription" }, { status: 500 });
  }
}
