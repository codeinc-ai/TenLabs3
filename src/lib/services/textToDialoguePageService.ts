// src/lib/services/textToDialoguePageService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Text to Dialogue Page User Data Interface
 * ==========================================
 * Defines the user data needed for the Text to Dialogue page.
 */
export interface TextToDialoguePageUserData {
  plan: "free" | "starter" | "creator" | "pro";
  usage: {
    dialogueGenerationsUsed: number;
    dialogueCharactersUsed: number;
  };
}

/**
 * Default user data returned when database is unavailable or user not found.
 */
function getDefaultUserData(): TextToDialoguePageUserData {
  return {
    plan: "free",
    usage: {
      dialogueGenerationsUsed: 0,
      dialogueCharactersUsed: 0,
    },
  };
}

/**
 * ==========================================
 * Get User Data for Text to Dialogue Page
 * ==========================================
 * Fetches user's plan and usage data for the Text to Dialogue page.
 *
 * @param clerkId - The Clerk user ID
 * @returns TextToDialoguePageUserData with plan and usage info
 */
export async function getUserForTextToDialogue(
  clerkId: string
): Promise<TextToDialoguePageUserData> {
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
        dialogueGenerationsUsed: user.usage?.dialogueGenerationsUsed || 0,
        dialogueCharactersUsed: user.usage?.dialogueCharactersUsed || 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "text-to-dialogue");
      scope.setTag("service", "textToDialoguePageService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    console.error("[textToDialoguePageService] Failed to fetch user data:", error);
    return getDefaultUserData();
  }
}
