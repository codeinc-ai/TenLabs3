// src/lib/services/voiceChangerService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadVoiceConversionToBackblaze,
} from "@/lib/services/backblazeService";
import { VoiceConversion } from "@/models/VoiceConversion";
import { User } from "@/models/User";
import { Voice } from "@/models/Voice";
import { PLANS, VOICE_CHANGER_CONFIG } from "@/constants";
import { VoiceChangerRequest } from "@/types/VoiceChangerRequest";
import { VoiceChangerResponse } from "@/types/VoiceChangerResponse";

/**
 * ==========================================
 * ElevenLabs Voice Changer Service
 * ==========================================
 * Responsibilities:
 * - Validate request payload
 * - Call ElevenLabs Speech-to-Speech API
 * - Upload original and converted audio to Backblaze B2
 * - Persist VoiceConversion metadata to MongoDB
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
  };
  return mimeMap[ext] || "audio/mpeg";
}

/**
 * Estimate audio duration from file size (rough approximation for mp3)
 * Assumes ~128kbps bitrate. For more accurate duration, consider using a library.
 */
function estimateDurationFromSize(byteLength: number): number {
  // 128 kbps = 16 KB/s
  const kbps = 128;
  const bytesPerSecond = (kbps * 1024) / 8;
  return byteLength / bytesPerSecond;
}

export const convertVoice = async (payload: VoiceChangerRequest): Promise<VoiceChangerResponse> => {
  const {
    userId,
    audioBuffer,
    fileName,
    targetVoiceId,
    modelId = VOICE_CHANGER_CONFIG.defaultModel,
    stability = VOICE_CHANGER_CONFIG.defaults.stability,
    similarityBoost = VOICE_CHANGER_CONFIG.defaults.similarityBoost,
    styleExaggeration = VOICE_CHANGER_CONFIG.defaults.styleExaggeration,
    removeBackgroundNoise = VOICE_CHANGER_CONFIG.defaults.removeBackgroundNoise,
    speakerBoost = VOICE_CHANGER_CONFIG.defaults.speakerBoost,
  } = payload;

  try {
    // 1) Validate inputs
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error("Audio file is required");
    }

    const fileSizeMB = audioBuffer.byteLength / (1024 * 1024);
    if (fileSizeMB > VOICE_CHANGER_CONFIG.maxFileSizeMB) {
      throw new Error(`File size exceeds maximum of ${VOICE_CHANGER_CONFIG.maxFileSizeMB}MB`);
    }

    const extension = getFileExtension(fileName);
    if (!VOICE_CHANGER_CONFIG.allowedFormats.includes(extension)) {
      throw new Error(
        `Unsupported format: ${extension}. Allowed formats: ${VOICE_CHANGER_CONFIG.allowedFormats.join(", ")}`
      );
    }

    if (!targetVoiceId) {
      throw new Error("Target voice ID is required");
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
    const nextConversionCount = (user.usage.voiceConversionsUsed || 0) + 1;

    if (nextConversionCount > limits.maxVoiceConversions) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "voice-changer",
          userId,
          plan: user.plan,
          limitType: "voice_conversions",
          attempted: nextConversionCount,
          limit: limits.maxVoiceConversions,
        },
      });

      throw new Error("User has exceeded voice conversion limit for their plan");
    }

    // 5) Fetch voice name for response
    const voice = await Voice.findOne({ voiceId: targetVoiceId });
    const targetVoiceName = voice?.name || "Unknown Voice";

    // 6) Call ElevenLabs Speech-to-Speech API
    const formData = new FormData();

    // Buffer can be backed by SharedArrayBuffer in some environments; make a plain Uint8Array copy
    const audioBytes = Uint8Array.from(audioBuffer);
    const blob = new Blob([audioBytes], {
      type: getMimeTypeFromExtension(extension),
    });

    formData.append("audio", blob, fileName);
    formData.append("model_id", modelId);
    formData.append("voice_settings", JSON.stringify({
      stability,
      similarity_boost: similarityBoost,
      style: styleExaggeration,
      use_speaker_boost: speakerBoost,
    }));

    if (removeBackgroundNoise) {
      formData.append("remove_background_noise", "true");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-speech/${targetVoiceId}?output_format=${VOICE_CHANGER_CONFIG.outputFormat}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    // Get the converted audio as a buffer
    const convertedArrayBuffer = await response.arrayBuffer();
    const convertedBuffer = Buffer.from(convertedArrayBuffer);

    // 7) Estimate duration from converted audio size
    const duration = estimateDurationFromSize(convertedBuffer.byteLength);
    const durationMinutes = duration / 60;

    // Check minutes limit
    const nextMinutesUsed = (user.usage.voiceConversionMinutesUsed || 0) + durationMinutes;
    if (nextMinutesUsed > limits.maxVoiceConversionMinutes) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "voice-changer",
          userId,
          plan: user.plan,
          limitType: "voice_conversion_minutes",
          attempted: nextMinutesUsed,
          limit: limits.maxVoiceConversionMinutes,
        },
      });

      throw new Error("User has exceeded voice conversion minutes limit for their plan");
    }

    // 8) Allocate conversion id up-front
    const conversionObjectId = new Types.ObjectId();
    const conversionId = conversionObjectId.toHexString();

    // 9) Upload original and converted audio to Backblaze B2
    const originalContentType = getMimeTypeFromExtension(extension);
    
    const [originalUpload, convertedUpload] = await Promise.all([
      uploadVoiceConversionToBackblaze({
        userId,
        conversionId,
        audioBuffer,
        type: "original",
        extension,
        contentType: originalContentType,
      }),
      uploadVoiceConversionToBackblaze({
        userId,
        conversionId,
        audioBuffer: convertedBuffer,
        type: "converted",
        extension: "mp3",
        contentType: "audio/mpeg",
      }),
    ]);

    // 10) Persist DB state
    try {
      await VoiceConversion.create({
        _id: conversionObjectId,
        userId: user._id,
        originalFileName: fileName,
        originalAudioPath: originalUpload.fileName,
        originalAudioFileId: originalUpload.fileId,
        targetVoiceId,
        targetVoiceName,
        convertedAudioPath: convertedUpload.fileName,
        convertedAudioFileId: convertedUpload.fileId,
        duration,
        modelId,
        settings: {
          stability,
          similarityBoost,
          styleExaggeration,
          removeBackgroundNoise,
          speakerBoost,
        },
      });
    } catch (dbError) {
      // Cleanup uploaded files on DB failure
      try {
        await Promise.all([
          deleteBackblazeFile({ fileName: originalUpload.fileName, fileId: originalUpload.fileId }),
          deleteBackblazeFile({ fileName: convertedUpload.fileName, fileId: convertedUpload.fileId }),
        ]);
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist voice conversion after uploading audio (and cleanup also failed)",
          {
            cause: { dbError, cleanupError },
          }
        );
      }

      throw new Error("Failed to persist voice conversion after uploading audio", { cause: dbError });
    }

    // 11) Update user usage
    try {
      user.usage.voiceConversionsUsed = nextConversionCount;
      user.usage.voiceConversionMinutesUsed = nextMinutesUsed;
      await user.save();
    } catch (usageError) {
      // Cleanup on usage update failure
      try {
        await VoiceConversion.deleteOne({ _id: conversionObjectId });
        await Promise.all([
          deleteBackblazeFile({ fileName: originalUpload.fileName, fileId: originalUpload.fileId }),
          deleteBackblazeFile({ fileName: convertedUpload.fileName, fileId: convertedUpload.fileId }),
        ]);
      } catch (cleanupError) {
        throw new Error("Failed to update user usage (and cleanup also failed)", {
          cause: { usageError, cleanupError },
        });
      }

      throw new Error("Failed to update user usage", { cause: usageError });
    }

    // 12) PostHog analytics
    capturePosthogServerEvent({
      distinctId: userId,
      event: "voice_conversion_created",
      properties: {
        feature: "voice-changer",
        userId,
        plan: user.plan,
        conversionId,
        durationSeconds: duration,
        targetVoiceId,
        targetVoiceName,
        modelId,
        fileExtension: extension,
        fileSizeMB,
      },
    });

    // 13) Return structured response
    return {
      conversionId,
      audioUrl: `/api/voice-changer/${conversionId}/audio`,
      duration,
      originalFileName: fileName,
      targetVoiceId,
      targetVoiceName,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-changer");
      scope.setTag("service", "voiceChangerService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("voice-changer", {
        fileName,
        fileSize: audioBuffer?.byteLength ?? 0,
        targetVoiceId,
        modelId,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};

/**
 * Get a voice conversion by ID
 */
export const getVoiceConversion = async (conversionId: string, userId: string) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const conversion = await VoiceConversion.findOne({
    _id: conversionId,
    userId: user._id,
  });

  if (!conversion) {
    throw new Error("Voice conversion not found");
  }

  return conversion;
};

/**
 * Get user's voice conversion history
 */
export const getVoiceConversions = async (userId: string, page = 1, limit = 10) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const skip = (page - 1) * limit;

  const [conversions, total] = await Promise.all([
    VoiceConversion.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VoiceConversion.countDocuments({ userId: user._id }),
  ]);

  return {
    conversions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
