// src/app/api/voices/my-voices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getMyVoices, addToMyVoices } from "@/lib/services/voiceService";

/**
 * ==========================================
 * GET /api/voices/my-voices
 * ==========================================
 * Returns user's saved voices.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const voices = await getMyVoices(userId);
    return NextResponse.json({ voices });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/voices/my-voices
 * ==========================================
 * Add a voice to user's collection.
 * Body: { voiceId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { voiceId } = body;

    if (!voiceId) {
      return NextResponse.json({ error: "Voice ID required" }, { status: 400 });
    }

    const result = await addToMyVoices(userId, voiceId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to save voice" }, { status: 500 });
  }
}
