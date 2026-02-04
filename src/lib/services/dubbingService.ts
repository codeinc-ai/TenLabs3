// src/lib/services/dubbingService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadDubbingToBackblaze,
} from "@/lib/services/backblazeService";
import { Dubbing } from "@/models/Dubbing";
import { User } from "@/models/User";
import { PLANS, DUBBING_CONFIG } from "@/constants";
import { DubbingRequest } from "@/types/DubbingRequest";
import { DubbingResponse } from "@/types/DubbingResponse";

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
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
  };
  return mimeMap[ext] || "audio/mpeg";
}

/**
 * Estimate audio duration from file size
 */
function estimateDurationFromSize(byteLength: number): number {
  const kbps = 128;
  const bytesPerSecond = (kbps * 1024) / 8;
  return byteLength / bytesPerSecond;
}

export const createDubbing = async (payload: DubbingRequest): Promise<DubbingResponse> => {
  const {
    userId,
    audioBuffer,
    fileName,
    projectName = "Untitled project",
    sourceLanguage,
    targetLanguages,
    numSpeakers,
    startTime,
    endTime,
    watermark,
    highestResolution,
  } = payload;

  try {
    // 1) Validate inputs
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error("Audio file is required");
    }

    const fileSizeMB = audioBuffer.byteLength / (1024 * 1024);
    if (fileSizeMB > DUBBING_CONFIG.maxFileSizeMB) {
      throw new Error(`File size exceeds maximum of ${DUBBING_CONFIG.maxFileSizeMB}MB`);
    }

    const extension = getFileExtension(fileName);
    if (!DUBBING_CONFIG.allowedFormats.includes(extension)) {
      throw new Error(
        `Unsupported format: ${extension}. Allowed formats: ${DUBBING_CONFIG.allowedFormats.join(", ")}`
      );
    }

    if (!targetLanguages || targetLanguages.length === 0) {
      throw new Error("At least one target language is required");
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
    const nextDubbingCount = (user.usage.dubbingsUsed || 0) + 1;

    if (nextDubbingCount > limits.maxDubbings) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "dubbing",
          userId,
          plan: user.plan,
          limitType: "dubbings",
          attempted: nextDubbingCount,
          limit: limits.maxDubbings,
        },
      });

      throw new Error("User has exceeded dubbing limit for their plan");
    }

    // 5) Call ElevenLabs Dubbing API
    const formData = new FormData();

    const audioBytes = Uint8Array.from(audioBuffer);
    const blob = new Blob([audioBytes], {
      type: getMimeTypeFromExtension(extension),
    });

    formData.append("file", blob, fileName);
    formData.append("target_lang", targetLanguages.join(","));

    if (sourceLanguage) {
      formData.append("source_lang", sourceLanguage);
    }
    if (numSpeakers) {
      formData.append("num_speakers", String(numSpeakers));
    }
    if (startTime !== undefined) {
      formData.append("start_time", String(startTime));
    }
    if (endTime !== undefined) {
      formData.append("end_time", String(endTime));
    }
    if (watermark !== undefined) {
      formData.append("watermark", String(watermark));
    }
    if (highestResolution !== undefined) {
      formData.append("highest_resolution", String(highestResolution));
    }

    const response = await fetch("https://api.elevenlabs.io/v1/dubbing", {
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

    const dubbingResult = (await response.json()) as {
      dubbing_id: string;
      expected_duration_sec?: number;
    };

    // 6) Estimate duration
    const duration = dubbingResult.expected_duration_sec || estimateDurationFromSize(audioBuffer.byteLength);
    const durationMinutes = duration / 60;

    // Check minutes limit
    const nextMinutesUsed = (user.usage.dubbingMinutesUsed || 0) + durationMinutes;
    if (nextMinutesUsed > limits.maxDubbingMinutes) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "dubbing",
          userId,
          plan: user.plan,
          limitType: "dubbing_minutes",
          attempted: nextMinutesUsed,
          limit: limits.maxDubbingMinutes,
        },
      });

      throw new Error("User has exceeded dubbing minutes limit for their plan");
    }

    // 7) Allocate project id up-front
    const projectObjectId = new Types.ObjectId();
    const projectId = projectObjectId.toHexString();

    // 8) Upload original to Backblaze B2
    const originalContentType = getMimeTypeFromExtension(extension);
    
    const originalUpload = await uploadDubbingToBackblaze({
      userId,
      projectId,
      audioBuffer,
      type: "original",
      extension,
      contentType: originalContentType,
    });

    // 9) Persist DB state
    try {
      await Dubbing.create({
        _id: projectObjectId,
        userId: user._id,
        dubbingId: dubbingResult.dubbing_id,
        projectName,
        originalFileName: fileName,
        originalAudioPath: originalUpload.fileName,
        originalAudioFileId: originalUpload.fileId,
        sourceLanguage: sourceLanguage || "auto",
        targetLanguages,
        status: "dubbing",
        duration,
        numSpeakers,
        startTime,
        endTime,
        watermark,
        highestResolution,
      });
    } catch (dbError) {
      try {
        await deleteBackblazeFile({ fileName: originalUpload.fileName, fileId: originalUpload.fileId });
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist dubbing project after uploading (and cleanup also failed)",
          {
            cause: { dbError, cleanupError },
          }
        );
      }

      throw new Error("Failed to persist dubbing project", { cause: dbError });
    }

    // 10) Update user usage
    try {
      user.usage.dubbingsUsed = nextDubbingCount;
      user.usage.dubbingMinutesUsed = nextMinutesUsed;
      await user.save();
    } catch (usageError) {
      try {
        await Dubbing.deleteOne({ _id: projectObjectId });
        await deleteBackblazeFile({ fileName: originalUpload.fileName, fileId: originalUpload.fileId });
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
      event: "dubbing_created",
      properties: {
        feature: "dubbing",
        userId,
        plan: user.plan,
        projectId,
        dubbingId: dubbingResult.dubbing_id,
        durationSeconds: duration,
        targetLanguages: targetLanguages.join(","),
        fileExtension: extension,
        fileSizeMB,
      },
    });

    // 12) Return structured response
    return {
      dubbingId: dubbingResult.dubbing_id,
      projectId,
      projectName,
      status: "dubbing",
      sourceLanguage: sourceLanguage || "auto",
      targetLanguages,
      originalFileName: fileName,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("service", "dubbingService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("dubbing", {
        fileName,
        fileSize: audioBuffer?.byteLength ?? 0,
        targetLanguages: targetLanguages?.join(","),
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};

/**
 * Get a dubbing project by ID
 */
export const getDubbing = async (projectId: string, userId: string) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const dubbing = await Dubbing.findOne({
    _id: projectId,
    userId: user._id,
  });

  if (!dubbing) {
    throw new Error("Dubbing project not found");
  }

  return dubbing;
};

/**
 * Get user's dubbing projects
 */
export const getDubbings = async (userId: string, page = 1, limit = 10) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const skip = (page - 1) * limit;

  const [dubbings, total] = await Promise.all([
    Dubbing.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Dubbing.countDocuments({ userId: user._id }),
  ]);

  return {
    dubbings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check dubbing status and download if ready
 */
export const checkDubbingStatus = async (projectId: string, userId: string) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const dubbing = await Dubbing.findOne({
    _id: projectId,
    userId: user._id,
  });

  if (!dubbing) {
    throw new Error("Dubbing project not found");
  }

  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsKey) {
    throw new Error("Missing ELEVENLABS_API_KEY environment variable");
  }

  // Check status from ElevenLabs
  const response = await fetch(
    `https://api.elevenlabs.io/v1/dubbing/${dubbing.dubbingId}`,
    {
      headers: {
        "xi-api-key": elevenLabsKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to check dubbing status (${response.status})`);
  }

  const statusData = (await response.json()) as {
    status: "pending" | "dubbing" | "dubbed" | "failed";
    error?: string;
  };

  // Update status in database
  dubbing.status = statusData.status;
  if (statusData.error) {
    dubbing.errorMessage = statusData.error;
  }
  await dubbing.save();

  return {
    projectId,
    dubbingId: dubbing.dubbingId,
    status: statusData.status,
    error: statusData.error,
  };
};
