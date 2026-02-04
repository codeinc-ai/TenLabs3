// src/lib/services/voiceIsolatorPageService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Voice Isolator Page User Data Interface
 * ==========================================
 * Defines the user data needed for the Voice Isolator page.
 */
export interface VoiceIsolatorPageUserData {
  plan: "free" | "pro";
  usage: {
    voiceIsolationsUsed: number;
    voiceIsolationMinutesUsed: number;
  };
}

/**
 * Default user data returned when database is unavailable or user not found.
 */
function getDefaultUserData(): VoiceIsolatorPageUserData {
  return {
    plan: "free",
    usage: {
      voiceIsolationsUsed: 0,
      voiceIsolationMinutesUsed: 0,
    },
  };
}

/**
 * ==========================================
 * Get User Data for Voice Isolator Page
 * ==========================================
 * Fetches user's plan and usage data for the Voice Isolator page.
 *
 * @param clerkId - The Clerk user ID
 * @returns VoiceIsolatorPageUserData with plan and usage info
 */
export async function getUserForVoiceIsolator(clerkId: string): Promise<VoiceIsolatorPageUserData> {
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
        voiceIsolationsUsed: user.usage?.voiceIsolationsUsed || 0,
        voiceIsolationMinutesUsed: user.usage?.voiceIsolationMinutesUsed || 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-isolator");
      scope.setTag("service", "voiceIsolatorPageService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[voiceIsolatorPageService] Failed to fetch user data:", error);
    return getDefaultUserData();
  }
}
