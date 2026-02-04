// src/lib/services/voiceService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { Voice, IVoice } from "@/models/Voice";
import { UserVoice, IUserVoice } from "@/models/UserVoice";

/**
 * ==========================================
 * Voice Item Interface
 * ==========================================
 */
export interface VoiceItem {
  id: string;
  voiceId: string;
  name: string;
  description?: string;
  gender?: "male" | "female" | "neutral";
  age?: "young" | "middle" | "old";
  category?: string;
  language?: string;
  accent?: string;
  previewUrl?: string;
  usageCount: number;
  isFeatured: boolean;
  isDefault: boolean;
  isSaved?: boolean;
  isFavorite?: boolean;
}

/**
 * ==========================================
 * Voice Query Options
 * ==========================================
 */
export interface VoiceQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  category?: string;
  featured?: boolean;
  defaultOnly?: boolean;
  sortBy?: "popular" | "newest" | "name";
}

/**
 * ==========================================
 * Voice List Response
 * ==========================================
 */
export interface VoiceListResponse {
  voices: VoiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    genders: string[];
    categories: string[];
    languages: string[];
  };
}

/**
 * ==========================================
 * Seed Default Voices
 * ==========================================
 * Ensures default voices exist in the database.
 */
export async function seedDefaultVoices(): Promise<void> {
  try {
    await connectToDB();

    // Default voices using actual ElevenLabs voice IDs
    // These IDs match the DEFAULT_VOICES in src/constants/index.ts
    const defaultVoicesData = [
      // Featured Voices
      {
        voiceId: "EXAVITQu4vr4xnSDxMaL",
        name: "Sarah",
        description: "A mature, reassuring voice perfect for conversational content and professional narration.",
        gender: "female" as const,
        age: "middle" as const,
        category: "Conversational",
        language: "en-US",
        accent: "American",
        usageCount: 0,
        isFeatured: true,
        isDefault: true,
      },
      {
        voiceId: "JBFqnCBsd6RMkjVDRZzb",
        name: "George",
        description: "A warm, captivating voice ideal for storytelling, audiobooks, and narration.",
        gender: "male" as const,
        age: "middle" as const,
        category: "Narration",
        language: "en-US",
        accent: "British",
        usageCount: 0,
        isFeatured: true,
        isDefault: true,
      },
      {
        voiceId: "SAz9YHcvj6GT2YYXdXww",
        name: "River",
        description: "A relaxed, neutral voice great for informative content, news, and documentaries.",
        gender: "neutral" as const,
        age: "middle" as const,
        category: "News",
        language: "en-US",
        accent: "American",
        usageCount: 0,
        isFeatured: true,
        isDefault: true,
      },
      // Regular Voices
      {
        voiceId: "FGY2WhTYpPnrIDTdsKH5",
        name: "Laura",
        description: "An enthusiastic voice with quirky attitude, perfect for commercials and promotional content.",
        gender: "female" as const,
        age: "young" as const,
        category: "Commercial",
        language: "en-US",
        accent: "American",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
      {
        voiceId: "Xb7hH8MSUJpSbSDYk0k2",
        name: "Alice",
        description: "A clear, engaging voice ideal for educational content and explainer videos.",
        gender: "female" as const,
        age: "middle" as const,
        category: "Educational",
        language: "en-US",
        accent: "British",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
      {
        voiceId: "N2lVS1w4EtoT3dr4eOWO",
        name: "Callum",
        description: "A husky, trickster voice perfect for character work and creative storytelling.",
        gender: "male" as const,
        age: "young" as const,
        category: "Characters",
        language: "en-US",
        accent: "American",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
      // Podcast Voices
      {
        voiceId: "CwhRBWXzGAHq8TQ4Fs17",
        name: "Roger",
        description: "A laid-back, casual voice with resonance, ideal for podcasts and long-form content.",
        gender: "male" as const,
        age: "middle" as const,
        category: "Podcast",
        language: "en-US",
        accent: "American",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
      {
        voiceId: "TX3LPaxmHKxFdv7VOQHJ",
        name: "Liam",
        description: "An energetic voice perfect for social media content and podcast hosting.",
        gender: "male" as const,
        age: "young" as const,
        category: "Podcast",
        language: "en-US",
        accent: "American",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
      // Gaming Voices
      {
        voiceId: "IKne3meq5aSn9XLyUdCD",
        name: "Charlie",
        description: "A deep, confident voice with energy, great for gaming content and announcements.",
        gender: "male" as const,
        age: "middle" as const,
        category: "Gaming",
        language: "en-US",
        accent: "Australian",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
      {
        voiceId: "SOYHLrjzK2X1ezoPC6cr",
        name: "Harry",
        description: "A fierce, warrior-like voice perfect for gaming streams and action content.",
        gender: "male" as const,
        age: "young" as const,
        category: "Gaming",
        language: "en-US",
        accent: "British",
        usageCount: 0,
        isFeatured: false,
        isDefault: true,
      },
    ];

    for (const voiceData of defaultVoicesData) {
      await Voice.findOneAndUpdate(
        { voiceId: voiceData.voiceId },
        { $setOnInsert: voiceData },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("[voiceService] Failed to seed default voices:", error);
  }
}

/**
 * ==========================================
 * Get All Voices
 * ==========================================
 */
export async function getVoices(
  clerkId: string | null,
  options: VoiceQueryOptions = {}
): Promise<VoiceListResponse> {
  const {
    page = 1,
    limit = 12,
    search = "",
    gender = "",
    category = "",
    featured = false,
    defaultOnly = false,
    sortBy = "popular",
  } = options;

  const defaultResponse: VoiceListResponse = {
    voices: [],
    total: 0,
    page,
    limit,
    totalPages: 0,
    filters: { genders: [], categories: [], languages: [] },
  };

  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return defaultResponse;
  }

  try {
    await connectToDB();
    await seedDefaultVoices();

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.isFeatured = true;
    }

    if (defaultOnly) {
      query.isDefault = true;
    }

    // Build sort
    let sort: Record<string, 1 | -1> = { usageCount: -1 };
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "name":
        sort = { name: 1 };
        break;
      default:
        sort = { usageCount: -1 };
    }

    const skip = (page - 1) * limit;

    // Get user's saved voices
    let savedVoiceIds: string[] = [];
    let favoriteVoiceIds: string[] = [];
    if (clerkId) {
      const userVoices = await UserVoice.find({ userId: clerkId }).lean<IUserVoice[]>();
      savedVoiceIds = userVoices.map((uv) => uv.voiceId.toString());
      favoriteVoiceIds = userVoices
        .filter((uv) => uv.isFavorite)
        .map((uv) => uv.voiceId.toString());
    }

    // Get voices and metadata
    const [voices, total, genders, categories, languages] = await Promise.all([
      Voice.find(query).sort(sort).skip(skip).limit(limit).lean<IVoice[]>(),
      Voice.countDocuments(query),
      Voice.distinct("gender"),
      Voice.distinct("category"),
      Voice.distinct("language"),
    ]);

    return {
      voices: voices.map((voice) => ({
        id: voice._id.toString(),
        voiceId: voice.voiceId,
        name: voice.name,
        description: voice.description,
        gender: voice.gender,
        age: voice.age,
        category: voice.category,
        language: voice.language,
        accent: voice.accent,
        previewUrl: voice.previewUrl,
        usageCount: voice.usageCount || 0,
        isFeatured: voice.isFeatured || false,
        isDefault: voice.isDefault,
        isSaved: savedVoiceIds.includes(voice._id.toString()),
        isFavorite: favoriteVoiceIds.includes(voice._id.toString()),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        genders: genders.filter(Boolean) as string[],
        categories: categories.filter(Boolean) as string[],
        languages: languages.filter(Boolean) as string[],
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voices");
      scope.setTag("service", "voiceService");
      Sentry.captureException(error);
    });

    console.error("[voiceService] Failed to fetch voices:", error);
    return defaultResponse;
  }
}

/**
 * ==========================================
 * Get Single Voice
 * ==========================================
 */
export async function getVoiceById(
  voiceId: string,
  clerkId: string | null
): Promise<VoiceItem | null> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return null;
  }

  try {
    await connectToDB();

    const voice = await Voice.findOne({ voiceId }).lean<IVoice>();
    if (!voice) return null;

    // Check if user has saved this voice
    let isSaved = false;
    let isFavorite = false;
    if (clerkId) {
      const userVoice = await UserVoice.findOne({
        userId: clerkId,
        voiceId: voice._id,
      }).lean<IUserVoice>();
      isSaved = !!userVoice;
      isFavorite = userVoice?.isFavorite || false;
    }

    return {
      id: voice._id.toString(),
      voiceId: voice.voiceId,
      name: voice.name,
      description: voice.description,
      gender: voice.gender,
      age: voice.age,
      category: voice.category,
      language: voice.language,
      accent: voice.accent,
      previewUrl: voice.previewUrl,
      usageCount: voice.usageCount || 0,
      isFeatured: voice.isFeatured || false,
      isDefault: voice.isDefault,
      isSaved,
      isFavorite,
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
}

/**
 * ==========================================
 * Get User's Saved Voices
 * ==========================================
 */
export async function getMyVoices(clerkId: string): Promise<VoiceItem[]> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectToDB();

    const userVoices = await UserVoice.find({ userId: clerkId })
      .populate("voiceId")
      .sort({ addedAt: -1 })
      .lean();

    return userVoices
      .filter((uv) => uv.voiceId)
      .map((uv) => {
        const voice = uv.voiceId as unknown as IVoice;
        return {
          id: voice._id.toString(),
          voiceId: voice.voiceId,
          name: voice.name,
          description: voice.description,
          gender: voice.gender,
          age: voice.age,
          category: voice.category,
          language: voice.language,
          accent: voice.accent,
          previewUrl: voice.previewUrl,
          usageCount: voice.usageCount || 0,
          isFeatured: voice.isFeatured || false,
          isDefault: voice.isDefault,
          isSaved: true,
          isFavorite: uv.isFavorite || false,
        };
      });
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
}

/**
 * ==========================================
 * Add Voice to My Voices
 * ==========================================
 */
export async function addToMyVoices(
  clerkId: string,
  voiceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const voice = await Voice.findOne({ voiceId });
    if (!voice) {
      return { success: false, error: "Voice not found" };
    }

    // Check if already saved
    const existing = await UserVoice.findOne({
      userId: clerkId,
      voiceId: voice._id,
    });

    if (existing) {
      return { success: true }; // Already saved
    }

    await UserVoice.create({
      userId: clerkId,
      voiceId: voice._id,
      isFavorite: false,
    });

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: "Failed to save voice" };
  }
}

/**
 * ==========================================
 * Remove Voice from My Voices
 * ==========================================
 */
export async function removeFromMyVoices(
  clerkId: string,
  voiceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();

    const voice = await Voice.findOne({ voiceId });
    if (!voice) {
      return { success: false, error: "Voice not found" };
    }

    await UserVoice.deleteOne({
      userId: clerkId,
      voiceId: voice._id,
    });

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: "Failed to remove voice" };
  }
}

/**
 * ==========================================
 * Toggle Voice Favorite
 * ==========================================
 */
export async function toggleVoiceFavorite(
  clerkId: string,
  voiceId: string
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  try {
    await connectToDB();

    const voice = await Voice.findOne({ voiceId });
    if (!voice) {
      return { success: false, error: "Voice not found" };
    }

    const userVoice = await UserVoice.findOne({
      userId: clerkId,
      voiceId: voice._id,
    });

    if (!userVoice) {
      // Auto-add to my voices and set as favorite
      await UserVoice.create({
        userId: clerkId,
        voiceId: voice._id,
        isFavorite: true,
      });
      return { success: true, isFavorite: true };
    }

    // Toggle favorite
    userVoice.isFavorite = !userVoice.isFavorite;
    await userVoice.save();

    return { success: true, isFavorite: userVoice.isFavorite };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: "Failed to update favorite" };
  }
}

/**
 * ==========================================
 * Increment Voice Usage Count
 * ==========================================
 */
export async function incrementVoiceUsage(voiceId: string): Promise<void> {
  try {
    await connectToDB();
    await Voice.updateOne({ voiceId }, { $inc: { usageCount: 1 } });
  } catch (error) {
    Sentry.captureException(error);
  }
}
