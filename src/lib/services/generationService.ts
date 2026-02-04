// src/lib/services/generationService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { Generation, IGeneration } from "@/models/Generation";
import { deleteBackblazeFile } from "@/lib/services/backblazeService";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Generation List Item Interface
 * ==========================================
 */
export interface GenerationListItem {
  id: string;
  text: string;
  voiceId: string;
  audioUrl: string;
  createdAt: string;
}

/**
 * ==========================================
 * Generation Detail Interface
 * ==========================================
 */
export interface GenerationDetail {
  id: string;
  text: string;
  voiceId: string;
  audioUrl: string;
  audioPath: string;
  length: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * Paginated Response Interface
 * ==========================================
 */
export interface PaginatedGenerations {
  generations: GenerationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ==========================================
 * Get User's Generations (Paginated)
 * ==========================================
 */
export async function getGenerations(
  clerkId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedGenerations> {
  // Skip during build
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return { generations: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    await connectToDB();

    // Get or create user with mock data
    const user = await getOrCreateUserWithMockData(clerkId);
    if (!user) {
      return { generations: [], total: 0, page, limit, totalPages: 0 };
    }

    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
      Generation.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IGeneration[]>(),
      Generation.countDocuments({ userId: user._id }),
    ]);

    return {
      generations: generations.map((gen) => ({
        id: gen._id.toString(),
        text: gen.text,
        voiceId: gen.voiceId,
        audioUrl: `/api/audio/${gen._id.toString()}`,
        createdAt: gen.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "generationService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[generationService] Failed to fetch generations:", error);
    return { generations: [], total: 0, page, limit, totalPages: 0 };
  }
}

/**
 * ==========================================
 * Get Single Generation by ID
 * ==========================================
 */
export async function getGenerationById(
  clerkId: string,
  generationId: string
): Promise<GenerationDetail | null> {
  // Skip during build
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return null;
  }

  try {
    await connectToDB();

    // Get or create user with mock data
    const user = await getOrCreateUserWithMockData(clerkId);
    if (!user) {
      return null;
    }

    const generation = await Generation.findOne({
      _id: generationId,
      userId: user._id,
    }).lean<IGeneration>();

    if (!generation) {
      return null;
    }

    return {
      id: generation._id.toString(),
      text: generation.text,
      voiceId: generation.voiceId,
      audioUrl: `/api/audio/${generation._id.toString()}`,
      audioPath: generation.audioPath,
      length: generation.length,
      createdAt: generation.createdAt.toISOString(),
      updatedAt: generation.updatedAt.toISOString(),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "generationService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("generationId", generationId);
      Sentry.captureException(error);
    });

    console.error("[generationService] Failed to fetch generation:", error);
    return null;
  }
}

/**
 * ==========================================
 * Delete Generation
 * ==========================================
 */
export async function deleteGeneration(
  clerkId: string,
  generationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const generation = await Generation.findOne({
      _id: generationId,
      userId: user._id,
    });

    if (!generation) {
      return { success: false, error: "Generation not found" };
    }

    // Delete from Backblaze
    if (generation.audioPath && generation.audioFileId) {
      try {
        await deleteBackblazeFile({
          fileName: generation.audioPath,
          fileId: generation.audioFileId,
        });
      } catch (b2Error) {
        // Log but continue - we still want to delete the DB record
        Sentry.withScope((scope) => {
          scope.setTag("feature", "tts");
          scope.setTag("service", "generationService");
          scope.setExtra("action", "deleteBackblazeFile");
          Sentry.captureException(b2Error);
        });
      }
    }

    // Delete from MongoDB
    await Generation.deleteOne({ _id: generationId });

    // Track deletion
    capturePosthogServerEvent({
      distinctId: clerkId,
      event: "generation_deleted",
      properties: {
        feature: "tts",
        userId: clerkId,
        generationId,
      },
    });

    return { success: true };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "generationService");
      scope.setExtra("clerkId", clerkId);
      scope.setExtra("generationId", generationId);
      Sentry.captureException(error);
    });

    console.error("[generationService] Failed to delete generation:", error);
    return { success: false, error: "Failed to delete generation" };
  }
}
