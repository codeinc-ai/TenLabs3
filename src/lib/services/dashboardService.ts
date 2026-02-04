// src/lib/services/dashboardService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { Generation, IGeneration } from "@/models/Generation";
import { Voice } from "@/models/Voice";
import { PLANS } from "@/constants";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Dashboard Stats Interface
 * ==========================================
 * Defines the shape of dashboard statistics returned to the client.
 */
export interface DashboardStats {
  user: {
    name: string;
    email: string;
    plan: "free" | "pro";
  };
  usage: {
    charactersUsed: number;
    charactersLimit: number;
    generationsUsed: number;
    generationsLimit: number;
  };
  voicesCount: number;
  recentGenerations: Array<{
    id: string;
    text: string;
    voiceId: string;
    audioUrl: string;
    createdAt: string;
  }>;
  activityLast7Days: number;
}

/**
 * ==========================================
 * Get Dashboard Stats
 * ==========================================
 * Fetches all statistics needed for the dashboard page.
 *
 * @param clerkId - The Clerk user ID
 * @returns DashboardStats object with user info, usage, and recent activity
 */
/**
 * Default stats returned when database is unavailable or user not found.
 */
function getDefaultStats(): DashboardStats {
  return {
    user: {
      name: "",
      email: "",
      plan: "free",
    },
    usage: {
      charactersUsed: 0,
      charactersLimit: PLANS.free.maxChars,
      generationsUsed: 0,
      generationsLimit: PLANS.free.maxGenerations,
    },
    voicesCount: 2,
    recentGenerations: [],
    activityLast7Days: 0,
  };
}

export async function getDashboardStats(clerkId: string): Promise<DashboardStats> {
  // Skip database calls during build time
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return getDefaultStats();
  }

  try {
    await connectToDB();

    // Get or create user with mock data
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return getDefaultStats();
    }

    const plan = user.plan || "free";
    const planLimits = PLANS[plan];

    // Get voice count (default + user's custom voices)
    const voicesCount = await Voice.countDocuments({
      $or: [{ isDefault: true }, { userId: clerkId }],
    });

    // Get recent generations (last 5)
    const recentGenerations = await Generation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean<IGeneration[]>();

    // Get activity in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityLast7Days = await Generation.countDocuments({
      userId: user._id,
      createdAt: { $gte: sevenDaysAgo },
    });

    return {
      user: {
        name: user.name || "",
        email: user.email,
        plan: plan,
      },
      usage: {
        charactersUsed: user.usage?.charactersUsed || 0,
        charactersLimit: planLimits.maxChars,
        generationsUsed: user.usage?.generationsUsed || 0,
        generationsLimit: planLimits.maxGenerations,
      },
      voicesCount: voicesCount || 2,
      recentGenerations: recentGenerations.map((gen) => ({
        id: gen._id.toString(),
        text: gen.text,
        voiceId: gen.voiceId,
        audioUrl: `/api/audio/${gen._id.toString()}`,
        createdAt: gen.createdAt.toISOString(),
      })),
      activityLast7Days,
    };
  } catch (error) {
    // Log error to Sentry but don't crash - return defaults
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dashboard");
      scope.setTag("service", "dashboardService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    // Return default stats on error (e.g., DB unavailable during build)
    console.error("[dashboardService] Failed to fetch stats:", error);
    return getDefaultStats();
  }
}
