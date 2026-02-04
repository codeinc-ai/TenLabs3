// src/app/api/text-to-dialogue/[dialogueId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { getDialogue, deleteDialogue } from "@/lib/services/textToDialogueService";

interface RouteParams {
  params: Promise<{ dialogueId: string }>;
}

/**
 * ==========================================
 * GET /api/text-to-dialogue/[dialogueId]
 * ==========================================
 * Returns metadata for a specific dialogue generation.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { dialogueId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dialogue = await getDialogue(dialogueId, userId);

    return NextResponse.json({
      id: dialogue._id,
      title: dialogue.title,
      inputs: dialogue.inputs,
      duration: dialogue.duration,
      totalCharacters: dialogue.totalCharacters,
      createdAt: dialogue.createdAt,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "text-to-dialogue");
      scope.setTag("route", "api/text-to-dialogue/[dialogueId]");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Dialogue not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * ==========================================
 * DELETE /api/text-to-dialogue/[dialogueId]
 * ==========================================
 * Deletes a dialogue generation.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { dialogueId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteDialogue(dialogueId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "text-to-dialogue");
      scope.setTag("route", "api/text-to-dialogue/[dialogueId]");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Dialogue not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
