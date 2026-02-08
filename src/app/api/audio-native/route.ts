import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createAudioNativeProject,
  getUserAudioNativeProjects,
} from "@/lib/services/audioNativeService";

export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "audio-native");
    scope.setTag("service", "api");

    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: user.id });

      const contentType = req.headers.get("content-type") || "";
      let name = "";
      let title: string | undefined;
      let author: string | undefined;
      let voiceId: string | undefined;
      let modelId: string | undefined;
      let textColor: string | undefined;
      let backgroundColor: string | undefined;
      let autoConvert = false;
      let applyTextNormalization: "auto" | "on" | "off" | "apply_english" | undefined;
      let fileBuffer: Buffer | undefined;
      let fileName: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        name = formData.get("name") as string;
        title = (formData.get("title") as string) || undefined;
        author = (formData.get("author") as string) || undefined;
        voiceId = (formData.get("voiceId") as string) || undefined;
        modelId = (formData.get("modelId") as string) || undefined;
        textColor = (formData.get("textColor") as string) || undefined;
        backgroundColor = (formData.get("backgroundColor") as string) || undefined;
        autoConvert = formData.get("autoConvert") === "true";
        const normVal = formData.get("applyTextNormalization") as string;
        if (normVal && ["auto", "on", "off", "apply_english"].includes(normVal)) {
          applyTextNormalization = normVal as "auto" | "on" | "off" | "apply_english";
        }

        const file = formData.get("file") as File | null;
        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          fileName = file.name;
        }
      } else {
        const body = await req.json();
        name = body.name;
        title = body.title;
        author = body.author;
        voiceId = body.voiceId;
        modelId = body.modelId;
        textColor = body.textColor;
        backgroundColor = body.backgroundColor;
        autoConvert = body.autoConvert ?? false;
        applyTextNormalization = body.applyTextNormalization;
      }

      if (!name) {
        return NextResponse.json(
          { error: "Missing required field: name" },
          { status: 400 }
        );
      }

      const result = await createAudioNativeProject(
        user.id,
        {
          name,
          title,
          author,
          voiceId,
          modelId,
          textColor,
          backgroundColor,
          autoConvert,
          applyTextNormalization,
        },
        fileBuffer,
        fileName
      );

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}

export async function GET() {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "audio-native");
    scope.setTag("service", "api");

    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: user.id });

      const projects = await getUserAudioNativeProjects(user.id);
      return NextResponse.json({ success: true, data: projects }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
