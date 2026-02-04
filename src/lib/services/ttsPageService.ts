// src/lib/services/ttsPageService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * TTS Page User Data Interface
 * ==========================================
 * Defines the user data needed for the TTS page.
 */
export interface TTSPageUserData {
  plan: "free" | "pro";
  usage: {
    charactersUsed: number;
    generationsUsed: number;
  };
}

/**
 * Default user data returned when database is unavailable or user not found.
 */
function getDefaultUserData(): TTSPageUserData {
  return {
    plan: "free",
    usage: {
      charactersUsed: 0,
      generationsUsed: 0,
    },
  };
}

/**
 * ==========================================
 * Get User Data for TTS Page
 * ==========================================
 * Fetches user's plan and usage data for the TTS page.
 *
 * @param clerkId - The Clerk user ID
 * @returns TTSPageUserData with plan and usage info
 */
export async function getUserForTTS(clerkId: string): Promise<TTSPageUserData> {
  // Skip database calls during build time
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return getDefaultUserData();
  }

  try {
    await connectToDB();

    // Get or create user with mock data
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return getDefaultUserData();
    }

    return {
      plan: user.plan || "free",
      usage: {
        charactersUsed: user.usage?.charactersUsed || 0,
        generationsUsed: user.usage?.generationsUsed || 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "ttsPageService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[ttsPageService] Failed to fetch user data:", error);
    return getDefaultUserData();
  }
}
