import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getVoiceSettings, updateVoiceSettings } from "@/lib/services/voiceService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voiceId } = await params;
    const settings = await getVoiceSettings(voiceId);
    return NextResponse.json({ success: true, data: settings });
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
    const body = await req.json();

    await updateVoiceSettings(voiceId, {
      stability: body.stability,
      similarity_boost: body.similarityBoost,
      style: body.style,
      use_speaker_boost: body.useSpeakerBoost,
      speed: body.speed,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
