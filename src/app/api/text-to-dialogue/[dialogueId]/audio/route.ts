// src/app/api/text-to-dialogue/[dialogueId]/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { streamDialogueAudio, getDialogue } from "@/lib/services/textToDialogueService";

interface RouteParams {
  params: Promise<{ dialogueId: string }>;
}

/**
 * ==========================================
 * GET /api/text-to-dialogue/[dialogueId]/audio
 * ==========================================
 * Streams the dialogue audio file from Backblaze B2.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { dialogueId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get dialogue to retrieve title for filename
    const dialogue = await getDialogue(dialogueId, userId);

    // Stream from Backblaze
    const result = await streamDialogueAudio(dialogueId, userId);

    // Clean title for filename
    const cleanTitle = dialogue.title.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(result.buffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${cleanTitle}.mp3"`,
        "Content-Length": String(result.contentLength),
      },
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "text-to-dialogue");
      scope.setTag("route", "api/text-to-dialogue/[dialogueId]/audio");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
