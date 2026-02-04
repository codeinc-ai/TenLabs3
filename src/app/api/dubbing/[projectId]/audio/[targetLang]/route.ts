// src/app/api/dubbing/[projectId]/audio/[targetLang]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

import { getDubbing } from "@/lib/services/dubbingService";

interface RouteParams {
  params: Promise<{ projectId: string; targetLang: string }>;
}

/**
 * ==========================================
 * GET /api/dubbing/[projectId]/audio/[targetLang]
 * ==========================================
 * Streams the dubbed audio file from ElevenLabs for the given target language.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { projectId, targetLang } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dubbing = await getDubbing(projectId, userId);

    if (dubbing.status !== "dubbed") {
      return NextResponse.json(
        { error: "Dubbing is not ready yet. Status: " + dubbing.status },
        { status: 400 }
      );
    }

    if (!dubbing.targetLanguages.includes(targetLang)) {
      return NextResponse.json(
        { error: `Language ${targetLang} is not a target for this project` },
        { status: 400 }
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/dubbing/${dubbing.dubbingId}/audio/${targetLang}`,
      {
        headers: {
          "xi-api-key": elevenLabsKey,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ElevenLabs audio fetch failed (${response.status}): ${text}`);
    }

    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${dubbing.projectName}_${targetLang}.mp3"`,
      },
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("route", "api/dubbing/[projectId]/audio/[targetLang]");
      Sentry.captureException(error);
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
