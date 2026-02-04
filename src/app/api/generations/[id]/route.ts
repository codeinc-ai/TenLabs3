// src/app/api/generations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getGenerationById, deleteGeneration } from "@/lib/services/generationService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * ==========================================
 * GET /api/generations/[id]
 * ==========================================
 * Returns a single generation by ID.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const generation = await getGenerationById(userId, id);

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    return NextResponse.json(generation);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("route", "api/generations/[id]");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to fetch generation" },
      { status: 500 }
    );
  }
}

/**
 * ==========================================
 * DELETE /api/generations/[id]
 * ==========================================
 * Deletes a generation and its audio file.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteGeneration(userId, id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("route", "api/generations/[id]");
      Sentry.captureException(error);
    });

    return NextResponse.json(
      { error: "Failed to delete generation" },
      { status: 500 }
    );
  }
}
