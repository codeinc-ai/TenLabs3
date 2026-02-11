// src/lib/providers/noiz/noizTtsService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { uploadAudioMp3ToBackblaze } from "@/lib/services/backblazeService";
import { NOIZ_TTS_DEFAULTS } from "@/constants/noiz";

const NOIZ_API_URL = "https://noiz.ai/v1";

interface NoizTtsOptions {
  qualityPreset?: number;
  speed?: number;
  outputFormat?: string;
}

interface GenerateSpeechResult {
  audioUrl: string;
  generationId: string;
  audioPath: string;
  audioFileId: string;
  duration?: number;
  characterCount?: number;
}

function getNoizApiKey(): string {
  const key = process.env.NOIZ_API_KEY;
  if (!key) {
    throw new Error("Missing NOIZ_API_KEY environment variable");
  }
  return key;
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  userId: string,
  options: NoizTtsOptions = {}
): Promise<GenerateSpeechResult> {
  try {
    if (!text) {
      throw new Error("Text is required");
    }

    const apiKey = getNoizApiKey();

    const formData = new FormData();
    formData.append("text", text);
    if (voiceId && voiceId !== "built-in-default") formData.append("voice_id", voiceId);
    formData.append("quality_preset", String(options.qualityPreset ?? NOIZ_TTS_DEFAULTS.qualityPreset));
    formData.append("output_format", options.outputFormat ?? NOIZ_TTS_DEFAULTS.outputFormat);
    formData.append("speed", String(options.speed ?? NOIZ_TTS_DEFAULTS.speed));

    // 30s timeout to avoid indefinite hangs
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(`${NOIZ_API_URL}/text-to-speech`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
        },
        body: formData,
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        throw new Error("Noiz API request timed out after 30 seconds");
      }
      throw new Error(
        `Failed to connect to Noiz API: ${fetchError instanceof Error ? fetchError.message : "Network error"}`
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Noiz API error (${response.status}): ${errorData.message || "Unknown error"}`);
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    const generationObjectId = new Types.ObjectId();
    const generationId = generationObjectId.toHexString();

    const upload = await uploadAudioMp3ToBackblaze({
      userId,
      generationId,
      audioBuffer,
    });

    return {
      audioUrl: upload.url,
      generationId,
      audioPath: upload.fileName,
      audioFileId: upload.fileId,
      characterCount: text.length,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "noizTtsService");
      scope.setTag("provider", "noiz");
      scope.setUser({ id: userId });
      scope.setContext("noiz_tts", {
        textLength: text?.length ?? 0,
        voiceId,
        qualityPreset: options.qualityPreset ?? NOIZ_TTS_DEFAULTS.qualityPreset,
      });
      Sentry.captureException(error);
    });

    throw error;
  }
}
