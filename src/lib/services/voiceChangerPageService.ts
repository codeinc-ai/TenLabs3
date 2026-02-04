// src/lib/services/voiceChangerPageService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Voice Changer Page User Data Interface
 * ==========================================
 * Defines the user data needed for the Voice Changer page.
 */
export interface VoiceChangerPageUserData {
  plan: "free" | "pro";
  usage: {
    voiceConversionsUsed: number;
    voiceConversionMinutesUsed: number;
  };
}

/**
 * Default user data returned when database is unavailable or user not found.
 */
function getDefaultUserData(): VoiceChangerPageUserData {
  return {
    plan: "free",
    usage: {
      voiceConversionsUsed: 0,
      voiceConversionMinutesUsed: 0,
    },
  };
}

/**
 * ==========================================
 * Get User Data for Voice Changer Page
 * ==========================================
 * Fetches user's plan and usage data for the Voice Changer page.
 *
 * @param clerkId - The Clerk user ID
 * @returns VoiceChangerPageUserData with plan and usage info
 */
export async function getUserForVoiceChanger(clerkId: string): Promise<VoiceChangerPageUserData> {
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
        voiceConversionsUsed: user.usage?.voiceConversionsUsed || 0,
        voiceConversionMinutesUsed: user.usage?.voiceConversionMinutesUsed || 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-changer");
      scope.setTag("service", "voiceChangerPageService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[voiceChangerPageService] Failed to fetch user data:", error);
    return getDefaultUserData();
  }
}
