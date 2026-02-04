// src/lib/services/ttsService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import { deleteBackblazeFile, uploadAudioMp3ToBackblaze } from "@/lib/services/backblazeService";
import { Generation } from "@/models/Generation";
import { User } from "@/models/User";
import { APP_CONFIG, DEFAULT_VOICES, PLANS, TTS_DEFAULTS } from "@/constants";
import { TTSRequest } from "@/types/TTSRequest";
import { TTSResponse } from "@/types/TTSResponse";

/**
 * ==========================================
 * ElevenLabs TTS Service
 * ==========================================
 * Responsibilities:
 * - Validate request payload
 * - Call ElevenLabs to generate MP3 bytes
 * - Upload the MP3 to Backblaze B2
 * - Persist Generation metadata (audioPath + audioUrl) to MongoDB
 * - Update user usage limits
 *
 * Notes:
 * - Stateless by design (no global caches)
 * - Throws errors with meaningful messages (Sentry-friendly)
 */

function envKeyForVoiceAlias(alias: string): string {
  // Ex: "bella" -> ELEVENLABS_VOICE_BELLA
  // Ex: "my-voice" -> ELEVENLABS_VOICE_MY_VOICE
  const safe = alias
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `ELEVENLABS_VOICE_${safe}`;
}

function resolveElevenLabsVoiceId(requestedVoiceId: string): string {
  // Optional mapping via env var (recommended in production)
  const mapped = process.env[envKeyForVoiceAlias(requestedVoiceId)];
  return mapped || requestedVoiceId;
}

export const generateSpeech = async (payload: TTSRequest): Promise<TTSResponse> => {
  const { userId, text, voiceId, stability, similarityBoost, format } = payload;

  try {
    // 1) Validate inputs
    if (!text) {
      throw new Error("Text is required");
    }

    if (text.length > APP_CONFIG.maxTextLength) {
      throw new Error(`Text exceeds maximum length of ${APP_CONFIG.maxTextLength}`);
    }

    // The Backblaze implementation in this project stores MP3.
    if (format && format !== "mp3") {
      throw new Error(`Unsupported format: ${format}. Only 'mp3' is supported.`);
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      throw new Error("Missing ELEVENLABS_API_KEY environment variable");
    }

    // 2) Ensure DB connection (Next.js server runtime may create many isolated instances)
    await connectToDB();

    // 3) Fetch user from DB
    // Clerk provides a stable string id, so we look up users by clerkId.
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // 4) Check usage limits (DRY: use PLANS constants)
    const plan = user.plan as keyof typeof PLANS;
    const limits = PLANS[plan];
    const nextCharCount = user.usage.charactersUsed + text.length;
    const nextGenerationCount = user.usage.generationsUsed + 1;

    if (nextCharCount > limits.maxChars) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "tts",
          userId,
          plan: user.plan,
          limitType: "characters",
          attempted: nextCharCount,
          limit: limits.maxChars,
        },
      });

      throw new Error("User has exceeded character limit for their plan");
    }

    if (nextGenerationCount > limits.maxGenerations) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "tts",
          userId,
          plan: user.plan,
          limitType: "generations",
          attempted: nextGenerationCount,
          limit: limits.maxGenerations,
        },
      });

      throw new Error("User has exceeded generation limit for their plan");
    }

    // 5) Determine voice
    const selectedVoice = voiceId || DEFAULT_VOICES[0]?.id;
    if (!selectedVoice) {
      throw new Error("No voiceId provided and no default voice configured");
    }

    const elevenLabsVoiceId = resolveElevenLabsVoiceId(selectedVoice);

    // 6) Prepare request body for ElevenLabs API
    const requestBody = {
      text,
      model_id: "eleven_multilingual_v2", // TODO: make configurable when multiple models are supported
      voice_settings: {
        stability: stability ?? TTS_DEFAULTS.stability,
        similarity_boost: similarityBoost ?? TTS_DEFAULTS.similarityBoost,
      },
    };

    // 7) Call ElevenLabs API (expects raw audio bytes)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  const audioArrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(audioArrayBuffer);

  // 8) Allocate generation id up-front so the Backblaze key matches the MongoDB document _id
  const generationObjectId = new Types.ObjectId();
  const generationId = generationObjectId.toHexString();

  // 9) Upload to Backblaze B2
  const upload = await uploadAudioMp3ToBackblaze({
    userId,
    generationId,
    audioBuffer,
  });

  // 10) Persist DB state. If persistence fails, attempt to delete the uploaded file to avoid orphans.
  try {
    await Generation.create({
      _id: generationObjectId,
      userId: user._id,
      text,
      voiceId: selectedVoice,
      audioPath: upload.fileName,
      audioUrl: upload.url,
      audioFileId: upload.fileId,
      length: 0, // TODO: compute duration when we add audio metadata parsing
    });
  } catch (dbError) {
    try {
      await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
    } catch (cleanupError) {
      throw new Error(
        "Failed to persist generation after uploading audio (and cleanup also failed)",
        {
          cause: { dbError, cleanupError },
        }
      );
    }

    throw new Error("Failed to persist generation after uploading audio", { cause: dbError });
  }

  // 11) Update user usage
  try {
    user.usage.charactersUsed = nextCharCount;
    user.usage.generationsUsed = nextGenerationCount;
    await user.save();
  } catch (usageError) {
    // At this point we already created a Generation doc. We attempt best-effort cleanup.
    try {
      await Generation.deleteOne({ _id: generationObjectId });
      await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
    } catch (cleanupError) {
      throw new Error("Failed to update user usage (and cleanup also failed)", {
        cause: { usageError, cleanupError },
      });
    }

    throw new Error("Failed to update user usage", { cause: usageError });
  }

  // 12) PostHog analytics (server-side)
  capturePosthogServerEvent({
    distinctId: userId,
    event: "generation_created",
    properties: {
      feature: "tts",
      userId,
      plan: user.plan,
      generationId,
      charactersUsed: text.length,
      voiceId: selectedVoice,
    },
  });

  // 13) Return structured response
  // Use proxy URL instead of direct Backblaze URL (bucket is private)
  return {
    generationId,
    audioUrl: `/api/audio/${generationId}`,
    length: 0,
    charactersUsed: text.length,
  };
  } catch (error) {
    // Error visibility (production): capture and rethrow.
    // IMPORTANT: Do not attach raw user text to Sentry.
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "ttsService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("tts", {
        textLength: text?.length ?? 0,
        voiceId,
        format: format ?? "mp3",
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};
