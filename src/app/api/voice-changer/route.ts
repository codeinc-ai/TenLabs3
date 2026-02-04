// src/app/api/voice-changer/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { convertVoice, getVoiceConversions } from "@/lib/services/voiceChangerService";

function parseBoolean(value: FormDataEntryValue | null): boolean | undefined {
  if (value === null) return undefined;
  const s = String(value).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  return undefined;
}

function parseNumber(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const num = parseFloat(String(value));
  return isNaN(num) ? undefined : num;
}

/**
 * ==========================================
 * GET /api/voice-changer
 * ==========================================
 * Lists user's voice conversions.
 *
 * Query params:
 * - page (default: 1)
 * - limit (default: 10, max: 50)
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

    const result = await getVoiceConversions(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-changer");
      scope.setTag("route", "api/voice-changer");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch voice conversions" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/voice-changer
 * ==========================================
 * Accepts multipart/form-data:
 * - file: File (required)
 * - targetVoiceId: string (required)
 * - modelId: string (optional)
 * - stability: number (optional, 0-1)
 * - similarityBoost: number (optional, 0-1)
 * - styleExaggeration: number (optional, 0-1)
 * - removeBackgroundNoise: boolean (optional)
 * - speakerBoost: boolean (optional)
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "voice-changer");
    scope.setTag("service", "api");
    scope.setTag("route", "api/voice-changer");

    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      const form = await req.formData();
      const file = form.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing required field: file" }, { status: 400 });
      }

      const targetVoiceId = form.get("targetVoiceId") as string | null;
      if (!targetVoiceId) {
        return NextResponse.json({ error: "Missing required field: targetVoiceId" }, { status: 400 });
      }

      const modelId = (form.get("modelId") as string | null) || undefined;
      const stability = parseNumber(form.get("stability"));
      const similarityBoost = parseNumber(form.get("similarityBoost"));
      const styleExaggeration = parseNumber(form.get("styleExaggeration"));
      const removeBackgroundNoise = parseBoolean(form.get("removeBackgroundNoise"));
      const speakerBoost = parseBoolean(form.get("speakerBoost"));

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const result = await convertVoice({
        userId,
        audioBuffer,
        fileName: file.name,
        targetVoiceId,
        modelId,
        stability,
        similarityBoost,
        styleExaggeration,
        removeBackgroundNoise,
        speakerBoost,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
