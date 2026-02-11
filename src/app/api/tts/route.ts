// src/app/api/tts/route.ts
import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { generateSpeech } from "@/lib/services/ttsService";
import { generateSpeech as generateMinimaxSpeech } from "@/lib/providers/minimax/minimaxTtsService";
import { generateSpeech as generateNoizSpeech } from "@/lib/providers/noiz/noizTtsService";
import { TTSRequest } from "@/types/TTSRequest";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Generation } from "@/models/Generation";
import { deleteBackblazeFile } from "@/lib/services/backblazeService";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import { PLANS } from "@/constants";

/**
 * ==========================================
 * TTS API Route
 * ==========================================
 * Handles POST requests to generate TTS audio.
 * Supports providers: "elevenlabs" (default), "minimax", "noiz"
 * Endpoint: /api/tts
 */
export async function POST(req: NextRequest) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("feature", "tts");
    scope.setTag("service", "api");

    try {
      // 1️⃣ Authenticate user
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      scope.setUser({ id: user.id });
      scope.setTag("userId", user.id);

      // 2️⃣ Parse request body
      const body = await req.json();
      const provider: string = body.provider || "elevenlabs";

      // 3️⃣ Validate required fields
      if (!body.text) {
        return NextResponse.json(
          { error: "Missing required field: text" },
          { status: 400 }
        );
      }

      scope.setTag("provider", provider);

      // 4️⃣ Route to the correct provider
      if (provider === "minimax") {
        const minimaxKey = process.env.MINIMAX_API_KEY;
        if (!minimaxKey) {
          return NextResponse.json(
            { error: "Minimax provider is not configured" },
            { status: 503 }
          );
        }

        const minimaxResult = await generateMinimaxSpeech(
          body.text,
          body.voiceId,
          user.id,
          {
            model: body.model,
            speed: body.speed,
            volume: body.volume,
            pitch: body.pitch,
            emotion: body.emotion,
          }
        );

        await connectToDB();

        const dbUser = await User.findOne({ clerkId: user.id });
        if (!dbUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const plan = dbUser.plan as keyof typeof PLANS;
        const limits = PLANS[plan];
        const nextCharCount = dbUser.usage.charactersUsed + body.text.length;
        const nextGenerationCount = dbUser.usage.generationsUsed + 1;

        if (nextCharCount > limits.maxChars) {
          return NextResponse.json(
            { error: "User has exceeded character limit for their plan" },
            { status: 403 }
          );
        }

        if (nextGenerationCount > limits.maxGenerations) {
          return NextResponse.json(
            { error: "User has exceeded generation limit for their plan" },
            { status: 403 }
          );
        }

        const generationId = minimaxResult.generationId;
        const audioUrl = `/api/audio/${generationId}`;
        const audioPath = minimaxResult.audioPath;
        const audioFileId = minimaxResult.audioFileId;

        try {
          await Generation.create({
            _id: new Types.ObjectId(generationId),
            userId: dbUser._id,
            text: body.text,
            voiceId: body.voiceId,
            audioPath,
            audioUrl: minimaxResult.audioUrl,
            audioFileId,
            length: minimaxResult.duration ?? 0,
            provider: "minimax",
          });
        } catch (dbError) {
          if (audioPath && audioFileId) {
            try {
              await deleteBackblazeFile({ fileName: audioPath, fileId: audioFileId });
            } catch {
              // cleanup failed
            }
          }
          throw dbError;
        }

        dbUser.usage.charactersUsed = nextCharCount;
        dbUser.usage.generationsUsed = nextGenerationCount;
        await dbUser.save();

        capturePosthogServerEvent({
          distinctId: user.id,
          event: "generation_created",
          properties: {
            feature: "tts",
            provider: "minimax",
            userId: user.id,
            plan: dbUser.plan,
            generationId,
            charactersUsed: body.text.length,
            voiceId: body.voiceId,
          },
        });

        return NextResponse.json(
          { success: true, data: { audioUrl, generationId } },
          { status: 200 }
        );
      }

      if (provider === "noiz") {
        const noizKey = process.env.NOIZ_API_KEY;
        if (!noizKey) {
          return NextResponse.json(
            { error: "Noiz provider is not configured" },
            { status: 503 }
          );
        }

        await connectToDB();

        const dbUser = await User.findOne({ clerkId: user.id });
        if (!dbUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const plan = dbUser.plan as keyof typeof PLANS;
        const limits = PLANS[plan];
        const nextCharCount = dbUser.usage.charactersUsed + body.text.length;
        const nextGenerationCount = dbUser.usage.generationsUsed + 1;

        if (nextCharCount > limits.maxChars) {
          return NextResponse.json(
            { error: "User has exceeded character limit for their plan" },
            { status: 403 }
          );
        }

        if (nextGenerationCount > limits.maxGenerations) {
          return NextResponse.json(
            { error: "User has exceeded generation limit for their plan" },
            { status: 403 }
          );
        }

        const noizResult = await generateNoizSpeech(
          body.text,
          body.voiceId || "",
          user.id,
          {
            qualityPreset: body.qualityPreset,
            speed: body.speed,
            outputFormat: body.outputFormat,
          }
        );

        const generationId = noizResult.generationId;
        const audioUrl = `/api/audio/${generationId}`;
        const audioPath = noizResult.audioPath;
        const audioFileId = noizResult.audioFileId;

        try {
          await Generation.create({
            _id: new Types.ObjectId(generationId),
            userId: dbUser._id,
            text: body.text,
            voiceId: body.voiceId,
            audioPath,
            audioUrl: noizResult.audioUrl,
            audioFileId,
            length: noizResult.duration ?? 0,
            provider: "noiz",
          });
        } catch (dbError) {
          if (audioPath && audioFileId) {
            try {
              await deleteBackblazeFile({ fileName: audioPath, fileId: audioFileId });
            } catch {
              // cleanup failed
            }
          }
          throw dbError;
        }

        dbUser.usage.charactersUsed = nextCharCount;
        dbUser.usage.generationsUsed = nextGenerationCount;
        await dbUser.save();

        capturePosthogServerEvent({
          distinctId: user.id,
          event: "generation_created",
          properties: {
            feature: "tts",
            provider: "noiz",
            userId: user.id,
            plan: dbUser.plan,
            generationId,
            charactersUsed: body.text.length,
            voiceId: body.voiceId,
          },
        });

        return NextResponse.json(
          { success: true, data: { audioUrl, generationId } },
          { status: 200 }
        );
      }

      // Default: ElevenLabs provider
      const result = await generateSpeech({ ...(body as TTSRequest), userId: user.id });

      // 5️⃣ Return success response
      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      Sentry.captureException(error);

      const message = error instanceof Error ? error.message : "Unknown error";

      // 6️⃣ Return error response
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  });
}
