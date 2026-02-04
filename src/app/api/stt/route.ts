// src/app/api/stt/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { transcribeAudio } from "@/lib/services/sttService";
import { getTranscriptions } from "@/lib/services/transcriptionService";

function parseBoolean(value: FormDataEntryValue | null): boolean | undefined {
  if (value === null) return undefined;
  const s = String(value).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  return undefined;
}

function parseKeyterms(value: FormDataEntryValue | null): string[] | undefined {
  if (value === null) return undefined;

  const raw = String(value).trim();
  if (!raw) return undefined;

  // Prefer JSON array if provided.
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const cleaned = parsed
        .map((v) => String(v).trim())
        .filter(Boolean)
        .slice(0, 100);
      return cleaned.length ? cleaned : undefined;
    }
  } catch {
    // fall back
  }

  // Fallback: comma-separated list.
  const cleaned = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 100);

  return cleaned.length ? cleaned : undefined;
}

/**
 * ==========================================
 * POST /api/stt
 * ==========================================
 * Accepts multipart/form-data:
 * - file: File
 * - language_code (optional)
 * - tag_audio_events (optional)
 * - keyterms (optional) JSON array string or comma-separated
 */
/**
 * ==========================================
 * GET /api/stt
 * ==========================================
 * Lists user's transcriptions.
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

    const result = await getTranscriptions(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("route", "api/stt");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch transcriptions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "stt");
    scope.setTag("service", "api");
    scope.setTag("route", "api/stt");

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

      const language =
        (form.get("language") as string | null) ||
        (form.get("language_code") as string | null) ||
        undefined;

      const tagAudioEvents =
        parseBoolean(form.get("tagAudioEvents")) ??
        parseBoolean(form.get("tag_audio_events")) ??
        undefined;

      const keyterms =
        parseKeyterms(form.get("keyterms")) ?? parseKeyterms(form.get("keyTerms"));

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const result = await transcribeAudio({
        userId,
        audioBuffer,
        fileName: file.name,
        language,
        tagAudioEvents,
        keyterms,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
