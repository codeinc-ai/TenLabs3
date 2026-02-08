import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import {
  getProjectSettings,
  updateProjectContent,
} from "@/lib/services/audioNativeService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "audio-native");

    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: user.id });
      const { projectId } = await params;

      const settings = await getProjectSettings(user.id, projectId);
      return NextResponse.json({ success: true, data: settings }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "audio-native");

    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: user.id });
      const { projectId } = await params;

      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const autoConvert = formData.get("autoConvert") === "true";
      const autoPublish = formData.get("autoPublish") === "true";

      const result = await updateProjectContent(
        user.id,
        projectId,
        fileBuffer,
        file.name,
        autoConvert,
        autoPublish
      );

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
