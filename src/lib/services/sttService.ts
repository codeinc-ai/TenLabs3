// src/lib/services/sttService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadTranscriptAudioToBackblaze,
} from "@/lib/services/backblazeService";
import { Transcription } from "@/models/Transcription";
import { User } from "@/models/User";
import { PLANS, STT_CONFIG } from "@/constants";
import { STTRequest } from "@/types/STTRequest";
import { STTResponse } from "@/types/STTResponse";

/**
 * ==========================================
 * ElevenLabs STT Service
 * ==========================================
 * Responsibilities:
 * - Validate request payload
 * - Call ElevenLabs Scribe API for transcription
 * - Upload the audio to Backblaze B2
 * - Persist Transcription metadata to MongoDB
 * - Update user usage limits
 *
 * Notes:
 * - Stateless by design (no global caches)
 * - Throws errors with meaningful messages (Sentry-friendly)
 */

/**
 * ElevenLabs Scribe API response structure
 */
interface ScribeResponse {
  text: string;
  language_code: string;
  language_probability: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    speaker?: string;
  }>;
  speakers?: Array<{
    speaker_id: string;
    name?: string;
  }>;
}

/**
 * Get file extension from filename
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "mp3";
}

/**
 * Get MIME type from file extension
 */
function getMimeTypeFromExtension(ext: string): string {
  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    flac: "audio/flac",
    ogg: "audio/ogg",
    webm: "audio/webm",
  };
  return mimeMap[ext] || "audio/mpeg";
}

/**
 * Estimate audio duration from file size (rough approximation)
 * For accurate duration, the ElevenLabs API response should be used when available
 */
function estimateDurationFromWords(words?: ScribeResponse["words"]): number {
  if (!words || words.length === 0) return 0;
  const lastWord = words[words.length - 1];
  return lastWord.end;
}

export const transcribeAudio = async (payload: STTRequest): Promise<STTResponse> => {
  const { userId, audioBuffer, fileName, language, tagAudioEvents, keyterms } = payload;

  try {
    // 1) Validate inputs
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error("Audio file is required");
    }

    const fileSizeMB = audioBuffer.byteLength / (1024 * 1024);
    if (fileSizeMB > STT_CONFIG.maxFileSizeMB) {
      throw new Error(`File size exceeds maximum of ${STT_CONFIG.maxFileSizeMB}MB`);
    }

    const extension = getFileExtension(fileName);
    if (!STT_CONFIG.allowedFormats.includes(extension)) {
      throw new Error(
        `Unsupported format: ${extension}. Allowed formats: ${STT_CONFIG.allowedFormats.join(", ")}`
      );
    }

    if (keyterms && keyterms.length > 100) {
      throw new Error("Maximum 100 keyterms allowed");
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      throw new Error("Missing ELEVENLABS_API_KEY environment variable");
    }

    // 2) Ensure DB connection
    await connectToDB();

    // 3) Fetch user from DB
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // 4) Check usage limits
    const plan = user.plan as keyof typeof PLANS;
    const limits = PLANS[plan];
    const nextTranscriptionCount = (user.usage.transcriptionsUsed || 0) + 1;

    if (nextTranscriptionCount > limits.maxTranscriptions) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "stt",
          userId,
          plan: user.plan,
          limitType: "transcriptions",
          attempted: nextTranscriptionCount,
          limit: limits.maxTranscriptions,
        },
      });

      throw new Error("User has exceeded transcription limit for their plan");
    }

    // 5) Call ElevenLabs Scribe API
    const formData = new FormData();

    // Buffer can be backed by SharedArrayBuffer in some environments; make a plain Uint8Array copy
    // so it always satisfies BlobPart typing and works with Blob/FormData.
    const audioBytes = Uint8Array.from(audioBuffer);
    const blob = new Blob([audioBytes], {
      type: getMimeTypeFromExtension(extension),
    });

    formData.append("file", blob, fileName);
    formData.append("model_id", STT_CONFIG.model);

    if (language) {
      formData.append("language_code", language);
    }
    if (tagAudioEvents !== undefined) {
      formData.append("tag_audio_events", String(tagAudioEvents));
    }
    if (keyterms && keyterms.length > 0) {
      formData.append("keyterms", JSON.stringify(keyterms));
    }

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const scribeResult = (await response.json()) as ScribeResponse;

    // 6) Calculate duration from words (if available)
    const duration = estimateDurationFromWords(scribeResult.words);
    const durationMinutes = duration / 60;

    // Check minutes limit
    const nextMinutesUsed = (user.usage.transcriptionMinutesUsed || 0) + durationMinutes;
    if (nextMinutesUsed > limits.maxTranscriptionMinutes) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "stt",
          userId,
          plan: user.plan,
          limitType: "transcription_minutes",
          attempted: nextMinutesUsed,
          limit: limits.maxTranscriptionMinutes,
        },
      });

      throw new Error("User has exceeded transcription minutes limit for their plan");
    }

    // 7) Allocate transcription id up-front
    const transcriptionObjectId = new Types.ObjectId();
    const transcriptionId = transcriptionObjectId.toHexString();

    // 8) Upload to Backblaze B2
    const contentType = getMimeTypeFromExtension(extension);
    const upload = await uploadTranscriptAudioToBackblaze({
      userId,
      transcriptionId,
      audioBuffer,
      extension,
      contentType,
    });

    // 9) Persist DB state
    try {
      await Transcription.create({
        _id: transcriptionObjectId,
        userId: user._id,
        originalFileName: fileName,
        audioPath: upload.fileName,
        audioFileId: upload.fileId,
        text: scribeResult.text,
        language: scribeResult.language_code || "en",
        languageProbability: scribeResult.language_probability || 0,
        duration,
        speakers: scribeResult.speakers?.map((s) => ({
          id: s.speaker_id,
          name: s.name || `Speaker ${s.speaker_id.replace("speaker_", "")}`,
        })),
        words: scribeResult.words?.map((w) => ({
          text: w.text,
          start: w.start,
          end: w.end,
          speaker: w.speaker,
        })),
      });
    } catch (dbError) {
      try {
        await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist transcription after uploading audio (and cleanup also failed)",
          {
            cause: { dbError, cleanupError },
          }
        );
      }

      throw new Error("Failed to persist transcription after uploading audio", { cause: dbError });
    }

    // 10) Update user usage
    try {
      user.usage.transcriptionsUsed = nextTranscriptionCount;
      user.usage.transcriptionMinutesUsed = nextMinutesUsed;
      await user.save();
    } catch (usageError) {
      try {
        await Transcription.deleteOne({ _id: transcriptionObjectId });
        await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
      } catch (cleanupError) {
        throw new Error("Failed to update user usage (and cleanup also failed)", {
          cause: { usageError, cleanupError },
        });
      }

      throw new Error("Failed to update user usage", { cause: usageError });
    }

    // 11) PostHog analytics
    capturePosthogServerEvent({
      distinctId: userId,
      event: "transcription_created",
      properties: {
        feature: "stt",
        userId,
        plan: user.plan,
        transcriptionId,
        durationSeconds: duration,
        language: scribeResult.language_code,
        fileExtension: extension,
        fileSizeMB,
      },
    });

    // 12) Return structured response
    return {
      transcriptionId,
      text: scribeResult.text,
      language: scribeResult.language_code || "en",
      duration,
      audioUrl: `/api/stt/${transcriptionId}/audio`,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "sttService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("stt", {
        fileName,
        fileSize: audioBuffer?.byteLength ?? 0,
        language: language ?? "auto",
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};
