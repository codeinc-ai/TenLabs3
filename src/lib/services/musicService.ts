// src/lib/services/musicService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadAudioMp3ToBackblaze,
} from "@/lib/services/backblazeService";
import { MusicGeneration, IMusicGeneration } from "@/models/MusicGeneration";
import { User, IUser } from "@/models/User";

/**
 * ==========================================
 * ElevenLabs Music Generation Service
 * ==========================================
 * Responsibilities:
 * - Validate request payload
 * - Call ElevenLabs Music API
 * - Upload generated audio to Backblaze B2
 * - Persist MusicGeneration metadata to MongoDB
 */

export interface MusicGenerateRequest {
  userId: string;
  prompt: string;
  durationMs?: number;
  forceInstrumental?: boolean;
  provider?: "elevenlabs" | "minimax";
  lyrics?: string;
}

export interface MusicGenerateResponse {
  generationId: string;
  audioUrl: string;
  durationMs: number;
  lyrics?: string;
  provider: string;
}

export interface MusicGenerationListItem {
  id: string;
  prompt: string;
  audioUrl: string;
  durationMs: number;
  forceInstrumental: boolean;
  isFavorite: boolean;
  lyrics?: string;
  provider: string;
  createdAt: string;
}

export interface PaginatedMusicGenerations {
  generations: MusicGenerationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generate music using ElevenLabs API
 */
export const generateMusic = async (
  request: MusicGenerateRequest
): Promise<MusicGenerateResponse> => {
  const { userId, prompt, durationMs, forceInstrumental, lyrics } = request;
  const provider = request.provider ?? "elevenlabs";

  try {
    // 1) Validate inputs
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Music prompt is required");
    }

    const requestedDuration = durationMs ?? 30000;

    if (requestedDuration < 3000 || requestedDuration > 600000) {
      throw new Error("Duration must be between 3000 and 600000 milliseconds");
    }

    // 2) Ensure DB connection
    await connectToDB();

    // 3) Fetch user from DB
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    let audioBuffer: Buffer;
    let actualDurationMs = requestedDuration;
    let lyricsForDb = lyrics?.trim() ?? "";

    if (provider === "minimax") {
      const minimaxKey = process.env.MINIMAX_API_KEY;
      if (!minimaxKey) {
        throw new Error("Missing MINIMAX_API_KEY environment variable");
      }

      let lyricsToUse = lyrics?.trim() ?? "";
      if (lyricsToUse.length === 0) {
        // Auto-generate lyrics via Minimax Lyrics Generation API
        const lyricsRes = await fetch("https://api.minimax.io/v1/lyrics_generation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${minimaxKey}`,
          },
          body: JSON.stringify({
            mode: "write_full_song",
            prompt: prompt.trim(),
          }),
        });

        if (!lyricsRes.ok) {
          const errText = await lyricsRes.text().catch(() => "");
          throw new Error(`Minimax Lyrics API error (${lyricsRes.status}): ${errText}`);
        }

        const lyricsData = (await lyricsRes.json()) as {
          lyrics?: string;
          base_resp?: { status_code?: number; status_msg?: string };
        };
        if (lyricsData.base_resp?.status_code !== 0) {
          throw new Error(
            `Minimax Lyrics API error: ${lyricsData.base_resp?.status_msg ?? "Unknown error"}`
          );
        }
        if (!lyricsData.lyrics?.trim()) {
          throw new Error("Minimax did not return lyrics. Please try again.");
        }
        lyricsToUse = lyricsData.lyrics.trim();
      }
      lyricsForDb = lyricsToUse;

      const response = await fetch("https://api.minimax.io/v1/music_generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${minimaxKey}`,
        },
        body: JSON.stringify({
          model: "music-2.5",
          prompt: prompt.trim(),
          lyrics: lyricsToUse,
          stream: false,
          output_format: "hex",
          audio_setting: {
            sample_rate: 44100,
            bitrate: 256000,
            format: "mp3",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Minimax API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.base_resp?.status_code !== 0) {
        throw new Error(
          `Minimax API error: ${data.base_resp?.status_msg ?? "Unknown error"}`
        );
      }

      audioBuffer = Buffer.from(data.data.audio, "hex");
      actualDurationMs = data.extra_info?.music_duration ?? requestedDuration;
    } else {
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsKey) {
        throw new Error("Missing ELEVENLABS_API_KEY environment variable");
      }

      const response = await fetch("https://api.elevenlabs.io/v1/music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          music_length_ms: requestedDuration,
          model_id: "music_v1",
          force_instrumental: forceInstrumental ?? false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
      }

      const audioArrayBuffer = await response.arrayBuffer();
      audioBuffer = Buffer.from(audioArrayBuffer);
    }

    // 5) Allocate generation id up-front
    const generationObjectId = new Types.ObjectId();
    const generationId = generationObjectId.toHexString();

    // 6) Upload to Backblaze B2
    const upload = await uploadAudioMp3ToBackblaze({
      userId,
      generationId,
      audioBuffer,
    });

    // 7) Persist DB state
    try {
      await MusicGeneration.create({
        _id: generationObjectId,
        userId: user._id,
        prompt: prompt.trim(),
        lyrics: lyricsForDb,
        audioPath: upload.fileName,
        audioUrl: upload.url,
        audioFileId: upload.fileId,
        durationMs: actualDurationMs,
        forceInstrumental: forceInstrumental ?? false,
        provider,
      });
    } catch (dbError) {
      try {
        await deleteBackblazeFile({ fileName: upload.fileName, fileId: upload.fileId });
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist music generation after uploading audio (and cleanup also failed)",
          { cause: { dbError, cleanupError } }
        );
      }

      throw new Error("Failed to persist music generation after uploading audio", {
        cause: dbError,
      });
    }

    // 8) PostHog analytics
    capturePosthogServerEvent({
      distinctId: userId,
      event: "music_generated",
      properties: {
        feature: "music",
        userId,
        plan: user.plan,
        generationId,
        durationMs: actualDurationMs,
        forceInstrumental: forceInstrumental ?? false,
        promptLength: prompt.length,
        provider,
      },
    });

    // 9) Return structured response
    return {
      generationId,
      audioUrl: `/api/music/${generationId}`,
      durationMs: actualDurationMs,
      lyrics: lyricsForDb,
      provider,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "music");
      scope.setTag("service", "musicService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("music", {
        promptLength: prompt?.length ?? 0,
        durationMs: durationMs ?? 30000,
        forceInstrumental: forceInstrumental ?? false,
        provider,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};

/**
 * Get user's music generations (paginated)
 */
export async function getMusicGenerations(
  clerkId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedMusicGenerations> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return { generations: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { generations: [], total: 0, page, limit, totalPages: 0 };
    }

    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
      MusicGeneration.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IMusicGeneration[]>(),
      MusicGeneration.countDocuments({ userId: user._id }),
    ]);

    return {
      generations: generations.map((g) => ({
        id: g._id.toString(),
        prompt: g.prompt,
        audioUrl: `/api/music/${g._id.toString()}`,
        durationMs: g.durationMs,
        forceInstrumental: g.forceInstrumental,
        isFavorite: g.isFavorite,
        lyrics: g.lyrics,
        provider: g.provider ?? "elevenlabs",
        createdAt: g.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "music");
      scope.setTag("service", "musicService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    return { generations: [], total: 0, page, limit, totalPages: 0 };
  }
}

/**
 * Get music generation audio source (for proxy route)
 */
export async function getMusicGenerationAudioSource(
  clerkId: string,
  generationId: string
): Promise<{ audioPath: string } | null> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) return null;

    const generation = await MusicGeneration.findOne({
      _id: generationId,
      userId: user._id,
    }).lean<IMusicGeneration>();

    if (!generation?.audioPath) return null;

    return { audioPath: generation.audioPath };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "music");
      scope.setTag("service", "musicService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("generationId", generationId);
      Sentry.captureException(error);
    });

    return null;
  }
}
