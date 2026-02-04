// src/lib/services/sfxService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadSoundEffectToBackblaze,
} from "@/lib/services/backblazeService";
import { SoundEffect, ISoundEffect } from "@/models/SoundEffect";
import { User, IUser } from "@/models/User";
import { PLANS, SFX_CONFIG } from "@/constants";
import { SFXRequest } from "@/types/SFXRequest";
import { SFXResponse } from "@/types/SFXResponse";

/**
 * ==========================================
 * ElevenLabs SFX Service
 * ==========================================
 * Responsibilities:
 * - Validate request payload
 * - Call ElevenLabs Sound Effects API
 * - Upload generated audio to Backblaze B2
 * - Persist SoundEffect metadata to MongoDB
 * - Update user usage limits
 */

export interface SoundEffectListItem {
  id: string;
  text: string;
  durationSeconds: number;
  audioUrl: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface PaginatedSoundEffects {
  soundEffects: SoundEffectListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generate a sound effect using ElevenLabs API
 */
export const generateSoundEffect = async (payload: SFXRequest): Promise<SFXResponse> => {
  const { userId, text, durationSeconds, promptInfluence } = payload;

  try {
    // 1) Validate inputs
    if (!text || text.trim().length === 0) {
      throw new Error("Sound effect description is required");
    }

    if (text.length > SFX_CONFIG.maxPromptLength) {
      throw new Error(`Description exceeds maximum of ${SFX_CONFIG.maxPromptLength} characters`);
    }

    if (durationSeconds !== undefined) {
      if (durationSeconds < SFX_CONFIG.minDuration || durationSeconds > SFX_CONFIG.maxDuration) {
        throw new Error(`Duration must be between ${SFX_CONFIG.minDuration} and ${SFX_CONFIG.maxDuration} seconds`);
      }
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
    const nextSfxCount = (user.usage.soundEffectsUsed || 0) + 1;

    if (nextSfxCount > limits.maxSoundEffects) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "sfx",
          userId,
          plan: user.plan,
          limitType: "sound_effects",
          attempted: nextSfxCount,
          limit: limits.maxSoundEffects,
        },
      });

      throw new Error("User has exceeded sound effect limit for their plan");
    }

    // 5) Call ElevenLabs Sound Effects API
    const requestBody: Record<string, unknown> = {
      text: text.trim(),
    };

    if (durationSeconds !== undefined) {
      requestBody.duration_seconds = durationSeconds;
    }

    if (promptInfluence !== undefined) {
      requestBody.prompt_influence = promptInfluence;
    }

    const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    // Response is audio/mpeg binary data
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    // Estimate duration from file size (rough approximation: 128kbps MP3 = ~16KB/sec)
    const estimatedDuration = durationSeconds || Math.round(audioBuffer.byteLength / 16000);

    // 6) Allocate sound effect id up-front
    const soundEffectObjectId = new Types.ObjectId();
    const soundEffectId = soundEffectObjectId.toHexString();

    // 7) Upload to Backblaze B2
    const upload = await uploadSoundEffectToBackblaze({
      userId,
      soundEffectId,
      audioBuffer,
    });

    // 8) Persist DB state
    try {
      await SoundEffect.create({
        _id: soundEffectObjectId,
        userId: user._id,
        text: text.trim(),
        audioPath: upload.fileName,
        audioUrl: upload.url,
        audioFileId: upload.fileId,
        durationSeconds: estimatedDuration,
      });
    } catch (dbError) {
      try {
        await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist sound effect after uploading audio (and cleanup also failed)",
          {
            cause: { dbError, cleanupError },
          }
        );
      }

      throw new Error("Failed to persist sound effect after uploading audio", { cause: dbError });
    }

    // 9) Update user usage
    try {
      user.usage.soundEffectsUsed = nextSfxCount;
      await user.save();
    } catch (usageError) {
      try {
        await SoundEffect.deleteOne({ _id: soundEffectObjectId });
        await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
      } catch (cleanupError) {
        throw new Error("Failed to update user usage (and cleanup also failed)", {
          cause: { usageError, cleanupError },
        });
      }

      throw new Error("Failed to update user usage", { cause: usageError });
    }

    // 10) PostHog analytics
    capturePosthogServerEvent({
      distinctId: userId,
      event: "sound_effect_created",
      properties: {
        feature: "sfx",
        userId,
        plan: user.plan,
        soundEffectId,
        durationSeconds: estimatedDuration,
        promptLength: text.length,
      },
    });

    // 11) Return structured response
    return {
      soundEffectId,
      text: text.trim(),
      durationSeconds: estimatedDuration,
      audioUrl: `/api/sfx/${soundEffectId}/audio`,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("service", "sfxService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("sfx", {
        textLength: text?.length ?? 0,
        durationSeconds: durationSeconds ?? "auto",
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};

/**
 * Get user's sound effects (paginated)
 */
export async function getSoundEffects(
  clerkId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedSoundEffects> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return { soundEffects: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { soundEffects: [], total: 0, page, limit, totalPages: 0 };
    }

    const skip = (page - 1) * limit;

    const [soundEffects, total] = await Promise.all([
      SoundEffect.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ISoundEffect[]>(),
      SoundEffect.countDocuments({ userId: user._id }),
    ]);

    return {
      soundEffects: soundEffects.map((s) => ({
        id: s._id.toString(),
        text: s.text,
        durationSeconds: s.durationSeconds,
        audioUrl: `/api/sfx/${s._id.toString()}/audio`,
        isFavorite: s.isFavorite,
        createdAt: s.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("service", "sfxService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    return { soundEffects: [], total: 0, page, limit, totalPages: 0 };
  }
}

/**
 * Get single sound effect by ID
 */
export async function getSoundEffectById(
  clerkId: string,
  soundEffectId: string
): Promise<SoundEffectListItem | null> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) return null;

    const soundEffect = await SoundEffect.findOne({
      _id: soundEffectId,
      userId: user._id,
    }).lean<ISoundEffect>();

    if (!soundEffect) return null;

    return {
      id: soundEffect._id.toString(),
      text: soundEffect.text,
      durationSeconds: soundEffect.durationSeconds,
      audioUrl: `/api/sfx/${soundEffect._id.toString()}/audio`,
      isFavorite: soundEffect.isFavorite,
      createdAt: soundEffect.createdAt.toISOString(),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("service", "sfxService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("soundEffectId", soundEffectId);
      Sentry.captureException(error);
    });

    return null;
  }
}

/**
 * Get sound effect audio source (for proxy route)
 */
export async function getSoundEffectAudioSource(
  clerkId: string,
  soundEffectId: string
): Promise<{ audioPath: string } | null> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) return null;

    const soundEffect = await SoundEffect.findOne({
      _id: soundEffectId,
      userId: user._id,
    }).lean<ISoundEffect>();

    if (!soundEffect?.audioPath) return null;

    return { audioPath: soundEffect.audioPath };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("service", "sfxService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("soundEffectId", soundEffectId);
      Sentry.captureException(error);
    });

    return null;
  }
}

/**
 * Delete sound effect
 */
export async function deleteSoundEffect(
  clerkId: string,
  soundEffectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const soundEffect = await SoundEffect.findOne({
      _id: soundEffectId,
      userId: user._id,
    });

    if (!soundEffect) {
      return { success: false, error: "Sound effect not found" };
    }

    if (soundEffect.audioPath) {
      try {
        await deleteBackblazeFile({
          fileName: soundEffect.audioPath,
          fileId: soundEffect.audioFileId,
        });
      } catch (b2Error) {
        Sentry.withScope((scope) => {
          scope.setTag("feature", "sfx");
          scope.setTag("service", "sfxService");
          scope.setExtra("action", "deleteBackblazeFile");
          scope.setExtra("soundEffectId", soundEffectId);
          Sentry.captureException(b2Error);
        });
      }
    }

    await SoundEffect.deleteOne({ _id: soundEffectId });

    capturePosthogServerEvent({
      distinctId: clerkId,
      event: "sound_effect_deleted",
      properties: {
        feature: "sfx",
        userId: clerkId,
        soundEffectId,
      },
    });

    return { success: true };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("service", "sfxService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("soundEffectId", soundEffectId);
      Sentry.captureException(error);
    });

    return { success: false, error: "Failed to delete sound effect" };
  }
}
