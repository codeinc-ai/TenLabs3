import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { getSharedVoices, addSharedVoice } from "@/lib/services/voiceService";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const result = await getSharedVoices({
      pageSize: parseInt(searchParams.get("pageSize") || "30"),
      page: parseInt(searchParams.get("page") || "0"),
      search: searchParams.get("search") || undefined,
      gender: searchParams.get("gender") || undefined,
      age: searchParams.get("age") || undefined,
      accent: searchParams.get("accent") || undefined,
      language: searchParams.get("language") || undefined,
      category: (searchParams.get("category") as "professional" | "famous" | "high_quality") || undefined,
      featured: searchParams.get("featured") === "true" || undefined,
      sort: searchParams.get("sort") || undefined,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to fetch shared voices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { publicUserId, voiceId, newName } = body;

    if (!publicUserId || !voiceId || !newName) {
      return NextResponse.json(
        { error: "Missing required fields: publicUserId, voiceId, newName" },
        { status: 400 }
      );
    }

    const result = await addSharedVoice(publicUserId, voiceId, newName);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
