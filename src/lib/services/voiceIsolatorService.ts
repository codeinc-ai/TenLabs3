// src/lib/services/voiceIsolatorService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadVoiceIsolationToBackblaze,
} from "@/lib/services/backblazeService";
import { VoiceIsolation } from "@/models/VoiceIsolation";
import { User } from "@/models/User";
import { PLANS, VOICE_ISOLATOR_CONFIG } from "@/constants";
import { VoiceIsolatorRequest } from "@/types/VoiceIsolatorRequest";
import { VoiceIsolatorResponse } from "@/types/VoiceIsolatorResponse";

/**
 * ==========================================
 * ElevenLabs Voice Isolator Service
 * ==========================================
 * Responsibilities:
 * - Validate request payload
 * - Call ElevenLabs Audio Isolation API
 * - Upload original and isolated audio to Backblaze B2
 * - Persist VoiceIsolation metadata to MongoDB
 * - Update user usage limits
 *
 * Notes:
 * - Stateless by design (no global caches)
 * - Throws errors with meaningful messages (Sentry-friendly)
 */

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
    mp4: "video/mp4",
  };
  return mimeMap[ext] || "audio/mpeg";
}

/**
 * Estimate audio duration from file size (rough approximation for mp3)
 * Assumes ~128kbps bitrate.
 */
function estimateDurationFromSize(byteLength: number): number {
  // 128 kbps = 16 KB/s
  const kbps = 128;
  const bytesPerSecond = (kbps * 1024) / 8;
  return byteLength / bytesPerSecond;
}

export const isolateVoice = async (payload: VoiceIsolatorRequest): Promise<VoiceIsolatorResponse> => {
  const { userId, audioBuffer, fileName } = payload;

  try {
    // 1) Validate inputs
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error("Audio file is required");
    }

    const fileSizeMB = audioBuffer.byteLength / (1024 * 1024);
    if (fileSizeMB > VOICE_ISOLATOR_CONFIG.maxFileSizeMB) {
      throw new Error(`File size exceeds maximum of ${VOICE_ISOLATOR_CONFIG.maxFileSizeMB}MB`);
    }

    const extension = getFileExtension(fileName);
    if (!VOICE_ISOLATOR_CONFIG.allowedFormats.includes(extension)) {
      throw new Error(
        `Unsupported format: ${extension}. Allowed formats: ${VOICE_ISOLATOR_CONFIG.allowedFormats.join(", ")}`
      );
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
    const nextIsolationCount = (user.usage.voiceIsolationsUsed || 0) + 1;

    if (nextIsolationCount > limits.maxVoiceIsolations) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "voice-isolator",
          userId,
          plan: user.plan,
          limitType: "voice_isolations",
          attempted: nextIsolationCount,
          limit: limits.maxVoiceIsolations,
        },
      });

      throw new Error("User has exceeded voice isolation limit for their plan");
    }

    // 5) Call ElevenLabs Audio Isolation API
    const formData = new FormData();

    // Buffer can be backed by SharedArrayBuffer in some environments; make a plain Uint8Array copy
    const audioBytes = Uint8Array.from(audioBuffer);
    const blob = new Blob([audioBytes], {
      type: getMimeTypeFromExtension(extension),
    });

    formData.append("audio", blob, fileName);

    const response = await fetch("https://api.elevenlabs.io/v1/audio-isolation", {
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

    // Get the isolated audio as a buffer
    const isolatedArrayBuffer = await response.arrayBuffer();
    const isolatedBuffer = Buffer.from(isolatedArrayBuffer);

    // 6) Estimate duration from isolated audio size
    const duration = estimateDurationFromSize(isolatedBuffer.byteLength);
    const durationMinutes = duration / 60;

    // Check minutes limit
    const nextMinutesUsed = (user.usage.voiceIsolationMinutesUsed || 0) + durationMinutes;
    if (nextMinutesUsed > limits.maxVoiceIsolationMinutes) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "voice-isolator",
          userId,
          plan: user.plan,
          limitType: "voice_isolation_minutes",
          attempted: nextMinutesUsed,
          limit: limits.maxVoiceIsolationMinutes,
        },
      });

      throw new Error("User has exceeded voice isolation minutes limit for their plan");
    }

    // 7) Allocate isolation id up-front
    const isolationObjectId = new Types.ObjectId();
    const isolationId = isolationObjectId.toHexString();

    // 8) Upload original and isolated audio to Backblaze B2
    const originalContentType = getMimeTypeFromExtension(extension);

    const [originalUpload, isolatedUpload] = await Promise.all([
      uploadVoiceIsolationToBackblaze({
        userId,
        isolationId,
        audioBuffer,
        type: "original",
        extension,
        contentType: originalContentType,
      }),
      uploadVoiceIsolationToBackblaze({
        userId,
        isolationId,
        audioBuffer: isolatedBuffer,
        type: "isolated",
        extension: "mp3",
        contentType: "audio/mpeg",
      }),
    ]);

    // 9) Persist DB state
    try {
      await VoiceIsolation.create({
        _id: isolationObjectId,
        userId: user._id,
        originalFileName: fileName,
        originalAudioPath: originalUpload.fileName,
        originalAudioFileId: originalUpload.fileId,
        isolatedAudioPath: isolatedUpload.fileName,
        isolatedAudioFileId: isolatedUpload.fileId,
        duration,
      });
    } catch (dbError) {
      // Cleanup uploaded files on DB failure
      try {
        await Promise.all([
          deleteBackblazeFile({ fileName: originalUpload.fileName, fileId: originalUpload.fileId }),
          deleteBackblazeFile({ fileName: isolatedUpload.fileName, fileId: isolatedUpload.fileId }),
        ]);
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist voice isolation after uploading audio (and cleanup also failed)",
          {
            cause: { dbError, cleanupError },
          }
        );
      }

      throw new Error("Failed to persist voice isolation after uploading audio", { cause: dbError });
    }

    // 10) Update user usage
    try {
      user.usage.voiceIsolationsUsed = nextIsolationCount;
      user.usage.voiceIsolationMinutesUsed = nextMinutesUsed;
      await user.save();
    } catch (usageError) {
      // Cleanup on usage update failure
      try {
        await VoiceIsolation.deleteOne({ _id: isolationObjectId });
        await Promise.all([
          deleteBackblazeFile({ fileName: originalUpload.fileName, fileId: originalUpload.fileId }),
          deleteBackblazeFile({ fileName: isolatedUpload.fileName, fileId: isolatedUpload.fileId }),
        ]);
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
      event: "voice_isolation_created",
      properties: {
        feature: "voice-isolator",
        userId,
        plan: user.plan,
        isolationId,
        durationSeconds: duration,
        fileExtension: extension,
        fileSizeMB,
      },
    });

    // 12) Return structured response
    return {
      isolationId,
      audioUrl: `/api/voice-isolator/${isolationId}/audio`,
      duration,
      originalFileName: fileName,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-isolator");
      scope.setTag("service", "voiceIsolatorService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("voice-isolator", {
        fileName,
        fileSize: audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};

/**
 * Get a voice isolation by ID
 */
export const getVoiceIsolation = async (isolationId: string, userId: string) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const isolation = await VoiceIsolation.findOne({
    _id: isolationId,
    userId: user._id,
  });

  if (!isolation) {
    throw new Error("Voice isolation not found");
  }

  return isolation;
};

/**
 * Get user's voice isolation history
 */
export const getVoiceIsolations = async (userId: string, page = 1, limit = 10) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const skip = (page - 1) * limit;

  const [isolations, total] = await Promise.all([
    VoiceIsolation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VoiceIsolation.countDocuments({ userId: user._id }),
  ]);

  return {
    isolations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
