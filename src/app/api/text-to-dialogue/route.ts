// src/app/api/text-to-dialogue/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { generateDialogue, getDialogues } from "@/lib/services/textToDialogueService";

/**
 * ==========================================
 * GET /api/text-to-dialogue
 * ==========================================
 * Lists user's dialogue generations.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    const result = await getDialogues(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "text-to-dialogue");
      scope.setTag("route", "api/text-to-dialogue");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch dialogues" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/text-to-dialogue
 * ==========================================
 * Creates a new dialogue generation.
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "text-to-dialogue");
    scope.setTag("service", "api");
    scope.setTag("route", "api/text-to-dialogue");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const body = await req.json();

      if (!body.inputs || !Array.isArray(body.inputs)) {
        return NextResponse.json(
          { error: "Missing required field: inputs" },
          { status: 400 }
        );
      }

      const result = await generateDialogue({
        userId,
        inputs: body.inputs,
        title: body.title,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
