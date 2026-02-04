// src/lib/services/seedService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { seedDefaultVoices } from "@/lib/services/voiceService";

/**
 * ==========================================
 * Ensure User Exists
 * ==========================================
 * Creates a user document if it doesn't exist.
 * Called by services before querying user data.
 *
 * @param clerkId - Clerk user ID
 * @param email - User email (optional, uses default if not provided)
 * @param name - User name (optional)
 * @returns The user document
 */
export async function ensureUserExists(
  clerkId: string,
  email?: string,
  name?: string
): Promise<IUser> {
  await connectToDB();

  let user = await User.findOne({ clerkId });

  if (!user) {
    // Create new user with fresh usage (starts at 0)
    user = await User.create({
      clerkId,
      email: email || `user_${clerkId.slice(-6)}@example.com`,
      name: name || "",
      plan: "free",
      usage: {
        charactersUsed: 0,
        generationsUsed: 0,
      },
    });

    console.log("[seedService] Created new user:", clerkId);
  }

  return user;
}

/**
 * ==========================================
 * Initialize User Data
 * ==========================================
 * Sets up a new user with default voices available.
 * No mock data is created - users start fresh.
 *
 * @param clerkId - Clerk user ID
 * @param email - User email (optional)
 * @param name - User name (optional)
 * @returns User document
 */
export async function initializeUserData(
  clerkId: string,
  email?: string,
  name?: string
): Promise<IUser> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    throw new Error("MongoDB URI required");
  }

  try {
    await connectToDB();

    // Ensure default voices exist (idempotent)
    await seedDefaultVoices();

    // Create or get user
    const user = await ensureUserExists(clerkId, email, name);

    return user;
  } catch (error) {
    Sentry.captureException(error);
    console.error("[seedService] Failed to initialize user:", error);
    throw error;
  }
}

/**
 * ==========================================
 * Get or Create User
 * ==========================================
 * Convenience function for services to get user
 * and ensure default voices exist.
 *
 * @param clerkId - Clerk user ID
 * @returns User document (never null)
 */
export async function getOrCreateUserWithMockData(
  clerkId: string,
  email?: string,
  name?: string
): Promise<IUser> {
  await connectToDB();

  let user = await User.findOne({ clerkId });

  if (!user) {
    // New user - initialize with default voices
    user = await initializeUserData(clerkId, email, name);
  } else {
    // Existing user - ensure voices are seeded (idempotent)
    await seedDefaultVoices();
  }

  return user;
}
