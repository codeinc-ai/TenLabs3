// src/lib/services/dubbingPageService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Dubbing Page User Data Interface
 * ==========================================
 * Defines the user data needed for the Dubbing page.
 */
export interface DubbingPageUserData {
  plan: "free" | "pro";
  usage: {
    dubbingsUsed: number;
    dubbingMinutesUsed: number;
  };
}

/**
 * Default user data returned when database is unavailable or user not found.
 */
function getDefaultUserData(): DubbingPageUserData {
  return {
    plan: "free",
    usage: {
      dubbingsUsed: 0,
      dubbingMinutesUsed: 0,
    },
  };
}

/**
 * ==========================================
 * Get User Data for Dubbing Page
 * ==========================================
 * Fetches user's plan and usage data for the Dubbing page.
 *
 * @param clerkId - The Clerk user ID
 * @returns DubbingPageUserData with plan and usage info
 */
export async function getUserForDubbing(clerkId: string): Promise<DubbingPageUserData> {
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
        dubbingsUsed: user.usage?.dubbingsUsed || 0,
        dubbingMinutesUsed: user.usage?.dubbingMinutesUsed || 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("service", "dubbingPageService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[dubbingPageService] Failed to fetch user data:", error);
    return getDefaultUserData();
  }
}
