// src/app/api/voice-changer/[conversionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { getVoiceConversion } from "@/lib/services/voiceChangerService";

interface RouteParams {
  params: Promise<{ conversionId: string }>;
}

/**
 * ==========================================
 * GET /api/voice-changer/[conversionId]
 * ==========================================
 * Returns metadata for a specific voice conversion.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { conversionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversion = await getVoiceConversion(conversionId, userId);

    return NextResponse.json({
      id: conversion._id,
      originalFileName: conversion.originalFileName,
      targetVoiceId: conversion.targetVoiceId,
      targetVoiceName: conversion.targetVoiceName,
      duration: conversion.duration,
      modelId: conversion.modelId,
      settings: conversion.settings,
      audioUrl: `/api/voice-changer/${conversionId}/audio`,
      createdAt: conversion.createdAt,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-changer");
      scope.setTag("route", "api/voice-changer/[conversionId]");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Voice conversion not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
