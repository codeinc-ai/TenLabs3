// src/lib/services/transcriptionService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import { deleteBackblazeFile } from "@/lib/services/backblazeService";
import { Transcription, ITranscription } from "@/models/Transcription";
import { User, IUser } from "@/models/User";

/**
 * ==========================================
 * Transcription List Item Interface
 * ==========================================
 */
export interface TranscriptionListItem {
  id: string;
  originalFileName: string;
  textPreview: string;
  language: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
}

/**
 * ==========================================
 * Transcription Detail Interface
 * ==========================================
 */
export interface TranscriptionDetail {
  id: string;
  originalFileName: string;
  audioUrl: string;
  text: string;
  language: string;
  languageProbability: number;
  duration: number;
  speakers?: ITranscription["speakers"];
  words?: ITranscription["words"];
  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * Paginated Response Interface
 * ==========================================
 */
export interface PaginatedTranscriptions {
  transcriptions: TranscriptionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function safePreview(text: string, maxLen: number = 120): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

/**
 * ==========================================
 * Get User's Transcriptions (Paginated)
 * ==========================================
 */
export async function getTranscriptions(
  clerkId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTranscriptions> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return { transcriptions: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { transcriptions: [], total: 0, page, limit, totalPages: 0 };
    }

    const skip = (page - 1) * limit;

    const [transcriptions, total] = await Promise.all([
      Transcription.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ITranscription[]>(),
      Transcription.countDocuments({ userId: user._id }),
    ]);

    return {
      transcriptions: transcriptions.map((t) => ({
        id: t._id.toString(),
        originalFileName: t.originalFileName,
        textPreview: safePreview(t.text),
        language: t.language,
        duration: t.duration,
        audioUrl: `/api/stt/${t._id.toString()}/audio`,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "transcriptionService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    return { transcriptions: [], total: 0, page, limit, totalPages: 0 };
  }
}

/**
 * ==========================================
 * Get Single Transcription by ID
 * ==========================================
 */
export async function getTranscriptionById(
  clerkId: string,
  transcriptionId: string
): Promise<TranscriptionDetail | null> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return null;
  }

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return null;
    }

    const transcription = await Transcription.findOne({
      _id: transcriptionId,
      userId: user._id,
    }).lean<ITranscription>();

    if (!transcription) return null;

    return {
      id: transcription._id.toString(),
      originalFileName: transcription.originalFileName,
      audioUrl: `/api/stt/${transcription._id.toString()}/audio`,
      text: transcription.text,
      language: transcription.language,
      languageProbability: transcription.languageProbability,
      duration: transcription.duration,
      speakers: transcription.speakers,
      words: transcription.words,
      createdAt: transcription.createdAt.toISOString(),
      updatedAt: transcription.updatedAt.toISOString(),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "transcriptionService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("transcriptionId", transcriptionId);
      Sentry.captureException(error);
    });

    return null;
  }
}

/**
 * ==========================================
 * Get Transcription Audio Source (Ownership-checked)
 * ==========================================
 * Internal helper for the /api/stt/[id]/audio proxy route.
 */
export async function getTranscriptionAudioSource(
  clerkId: string,
  transcriptionId: string
): Promise<{ audioPath: string } | null> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return null;
  }

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) return null;

    const transcription = await Transcription.findOne({
      _id: transcriptionId,
      userId: user._id,
    }).lean<ITranscription>();

    if (!transcription?.audioPath) return null;

    return { audioPath: transcription.audioPath };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "transcriptionService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("transcriptionId", transcriptionId);
      scope.setExtra("action", "getTranscriptionAudioSource");
      Sentry.captureException(error);
    });

    return null;
  }
}

/**
 * ==========================================
 * Delete Transcription
 * ==========================================
 * Deletes the transcription metadata from MongoDB and best-effort deletes
 * the original uploaded audio from Backblaze.
 */
export async function deleteTranscription(
  clerkId: string,
  transcriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const transcription = await Transcription.findOne({
      _id: transcriptionId,
      userId: user._id,
    });

    if (!transcription) {
      return { success: false, error: "Transcription not found" };
    }

    if (transcription.audioPath) {
      try {
        await deleteBackblazeFile({
          fileName: transcription.audioPath,
          fileId: transcription.audioFileId,
        });
      } catch (b2Error) {
        // Best effort; still delete the DB record.
        Sentry.withScope((scope) => {
          scope.setTag("feature", "stt");
          scope.setTag("service", "transcriptionService");
          scope.setExtra("action", "deleteBackblazeFile");
          scope.setExtra("transcriptionId", transcriptionId);
          Sentry.captureException(b2Error);
        });
      }
    }

    await Transcription.deleteOne({ _id: transcriptionId });

    capturePosthogServerEvent({
      distinctId: clerkId,
      event: "transcription_deleted",
      properties: {
        feature: "stt",
        userId: clerkId,
        transcriptionId,
      },
    });

    return { success: true };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "transcriptionService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("transcriptionId", transcriptionId);
      Sentry.captureException(error);
    });

    return { success: false, error: "Failed to delete transcription" };
  }
}
