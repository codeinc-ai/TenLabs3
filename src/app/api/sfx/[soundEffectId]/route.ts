// src/app/api/sfx/[soundEffectId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import {
  deleteSoundEffect,
  getSoundEffectById,
} from "@/lib/services/sfxService";

interface RouteParams {
  params: Promise<{ soundEffectId: string }>;
}

/**
 * ==========================================
 * GET /api/sfx/[soundEffectId]
 * ==========================================
 * Returns a single sound effect by ID.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { soundEffectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const soundEffect = await getSoundEffectById(userId, soundEffectId);

    if (!soundEffect) {
      return NextResponse.json({ error: "Sound effect not found" }, { status: 404 });
    }

    return NextResponse.json(soundEffect);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("route", "api/sfx/[soundEffectId]");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch sound effect" }, { status: 500 });
  }
}

/**
 * ==========================================
 * DELETE /api/sfx/[soundEffectId]
 * ==========================================
 * Deletes a sound effect and its uploaded audio.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { soundEffectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteSoundEffect(userId, soundEffectId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("route", "api/sfx/[soundEffectId]");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to delete sound effect" }, { status: 500 });
  }
}
