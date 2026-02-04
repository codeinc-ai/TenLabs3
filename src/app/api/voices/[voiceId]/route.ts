// src/app/api/voices/[voiceId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getVoiceById } from "@/lib/services/voiceService";

interface RouteParams {
  params: Promise<{ voiceId: string }>;
}

/**
 * ==========================================
 * GET /api/voices/[voiceId]
 * ==========================================
 * Returns a single voice by ID.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { voiceId } = await params;

    const voice = await getVoiceById(voiceId, userId);

    if (!voice) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 });
    }

    return NextResponse.json(voice);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to fetch voice" }, { status: 500 });
  }
}
