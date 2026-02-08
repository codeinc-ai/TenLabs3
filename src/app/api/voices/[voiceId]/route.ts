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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voiceId } = await params;

    const { deleteVoice } = await import("@/lib/services/voiceService");
    await deleteVoice(voiceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voiceId } = await params;
    const formData = await req.formData();
    const name = formData.get("name") as string;

    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    const description = (formData.get("description") as string) || undefined;
    const labelsStr = formData.get("labels") as string | null;
    const removeNoise = formData.get("removeBackgroundNoise") === "true";
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    const { editVoice } = await import("@/lib/services/voiceService");
    await editVoice(voiceId, name, {
      description,
      files: files.length ? files : undefined,
      labels: labelsStr ? JSON.parse(labelsStr) : undefined,
      removeBackgroundNoise: removeNoise || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
