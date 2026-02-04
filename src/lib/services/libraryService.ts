// src/lib/services/libraryService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { Generation, IGeneration } from "@/models/Generation";
import { deleteBackblazeFile } from "@/lib/services/backblazeService";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Library Item Interface
 * ==========================================
 */
export interface LibraryItem {
  id: string;
  text: string;
  voiceId: string;
  audioUrl: string;
  duration: number;
  isFavorite: boolean;
  createdAt: string;
}

/**
 * ==========================================
 * Library Query Options
 * ==========================================
 */
export interface LibraryQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  voiceId?: string;
  favorites?: boolean;
  sortBy?: "newest" | "oldest" | "longest" | "shortest";
}

/**
 * ==========================================
 * Library Response
 * ==========================================
 */
export interface LibraryResponse {
  items: LibraryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalItems: number;
    totalFavorites: number;
    voices: string[];
  };
}

/**
 * ==========================================
 * Get Library Items
 * ==========================================
 */
export async function getLibraryItems(
  clerkId: string,
  options: LibraryQueryOptions = {}
): Promise<LibraryResponse> {
  const {
    page = 1,
    limit = 12,
    search = "",
    voiceId = "",
    favorites = false,
    sortBy = "newest",
  } = options;

  // Default response for build time or errors
  const defaultResponse: LibraryResponse = {
    items: [],
    total: 0,
    page,
    limit,
    totalPages: 0,
    stats: { totalItems: 0, totalFavorites: 0, voices: [] },
  };

  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return defaultResponse;
  }

  try {
    await connectToDB();

    // Get or create user with mock data
    const user = await getOrCreateUserWithMockData(clerkId);
    if (!user) {
      return defaultResponse;
    }

    // Build query
    const query: Record<string, unknown> = { userId: user._id };

    // Search filter
    if (search) {
      query.text = { $regex: search, $options: "i" };
    }

    // Voice filter
    if (voiceId) {
      query.voiceId = voiceId;
    }

    // Favorites filter
    if (favorites) {
      query.isFavorite = true;
    }

    // Build sort
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sortBy) {
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "longest":
        sort = { length: -1 };
        break;
      case "shortest":
        sort = { length: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Get items and counts in parallel
    const [items, total, totalFavorites, voicesAgg] = await Promise.all([
      Generation.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<IGeneration[]>(),
      Generation.countDocuments(query),
      Generation.countDocuments({ userId: user._id, isFavorite: true }),
      Generation.distinct("voiceId", { userId: user._id }),
    ]);

    // Get total items (without filters)
    const totalItems = await Generation.countDocuments({ userId: user._id });

    return {
      items: items.map((item) => ({
        id: item._id.toString(),
        text: item.text,
        voiceId: item.voiceId,
        audioUrl: `/api/audio/${item._id.toString()}`,
        duration: item.length || 0,
        isFavorite: (item as IGeneration & { isFavorite?: boolean }).isFavorite || false,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalItems,
        totalFavorites,
        voices: voicesAgg as string[],
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "library");
      scope.setTag("service", "libraryService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[libraryService] Failed to fetch library:", error);
    return defaultResponse;
  }
}

/**
 * ==========================================
 * Toggle Favorite
 * ==========================================
 */
export async function toggleFavorite(
  clerkId: string,
  generationId: string
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
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

    // Toggle the favorite status
    const currentFavorite = (generation as IGeneration & { isFavorite?: boolean }).isFavorite || false;
    const newFavorite = !currentFavorite;

    await Generation.updateOne(
      { _id: generationId },
      { $set: { isFavorite: newFavorite } }
    );

    return { success: true, isFavorite: newFavorite };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "library");
      scope.setTag("service", "libraryService");
      Sentry.captureException(error);
    });

    return { success: false, error: "Failed to update favorite" };
  }
}

/**
 * ==========================================
 * Bulk Delete
 * ==========================================
 */
export async function bulkDeleteGenerations(
  clerkId: string,
  generationIds: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).lean<IUser>();
    if (!user) {
      return { success: false, deletedCount: 0, error: "User not found" };
    }

    // Find all generations to delete
    const generations = await Generation.find({
      _id: { $in: generationIds },
      userId: user._id,
    });

    // Delete from Backblaze (best effort)
    for (const gen of generations) {
      if (gen.audioPath && gen.audioFileId) {
        try {
          await deleteBackblazeFile({
            fileName: gen.audioPath,
            fileId: gen.audioFileId,
          });
        } catch (b2Error) {
          Sentry.captureException(b2Error);
        }
      }
    }

    // Delete from MongoDB
    const result = await Generation.deleteMany({
      _id: { $in: generationIds },
      userId: user._id,
    });

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "library");
      scope.setTag("service", "libraryService");
      Sentry.captureException(error);
    });

    return { success: false, deletedCount: 0, error: "Failed to delete" };
  }
}
