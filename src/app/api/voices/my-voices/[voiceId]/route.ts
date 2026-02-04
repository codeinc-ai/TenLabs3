// src/app/api/voices/my-voices/[voiceId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { removeFromMyVoices, toggleVoiceFavorite } from "@/lib/services/voiceService";

interface RouteParams {
  params: Promise<{ voiceId: string }>;
}

/**
 * ==========================================
 * DELETE /api/voices/my-voices/[voiceId]
 * ==========================================
 * Remove a voice from user's collection.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { voiceId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await removeFromMyVoices(userId, voiceId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to remove voice" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/voices/my-voices/[voiceId]
 * ==========================================
 * Toggle favorite status.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { voiceId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await toggleVoiceFavorite(userId, voiceId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, isFavorite: result.isFavorite });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  }
}
