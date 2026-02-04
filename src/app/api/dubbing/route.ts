// src/app/api/dubbing/route.ts
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createDubbing, getDubbings } from "@/lib/services/dubbingService";

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
 * GET /api/dubbing
 * ==========================================
 * Lists user's dubbing projects.
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

    const result = await getDubbings(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("route", "api/dubbing");
      Sentry.captureException(error);
    });

    return NextResponse.json({ error: "Failed to fetch dubbing projects" }, { status: 500 });
  }
}

/**
 * ==========================================
 * POST /api/dubbing
 * ==========================================
 * Creates a new dubbing project.
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "dubbing");
    scope.setTag("service", "api");
    scope.setTag("route", "api/dubbing");

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

      const targetLanguagesStr = form.get("targetLanguages") as string | null;
      if (!targetLanguagesStr) {
        return NextResponse.json({ error: "Missing required field: targetLanguages" }, { status: 400 });
      }

      const targetLanguages = targetLanguagesStr.split(",").map((lang) => lang.trim());

      const projectName = (form.get("projectName") as string | null) || "Untitled project";
      const sourceLanguage = (form.get("sourceLanguage") as string | null) || undefined;
      const numSpeakers = parseNumber(form.get("numSpeakers"));
      const startTime = parseNumber(form.get("startTime"));
      const endTime = parseNumber(form.get("endTime"));
      const watermark = parseBoolean(form.get("watermark"));
      const highestResolution = parseBoolean(form.get("highestResolution"));

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const result = await createDubbing({
        userId,
        audioBuffer,
        fileName: file.name,
        projectName,
        sourceLanguage,
        targetLanguages,
        numSpeakers,
        startTime,
        endTime,
        watermark,
        highestResolution,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
