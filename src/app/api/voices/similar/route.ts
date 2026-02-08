import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { findSimilarVoices } from "@/lib/services/voiceService";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audioFile") as File | null;
    const similarityThreshold = formData.get("similarityThreshold");
    const topK = formData.get("topK");

    const result = await findSimilarVoices(
      audioFile || undefined,
      similarityThreshold ? parseFloat(similarityThreshold as string) : undefined,
      topK ? parseInt(topK as string) : undefined
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
