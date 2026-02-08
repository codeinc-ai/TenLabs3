// src/lib/services/usageService.ts
import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { Generation, IGeneration } from "@/models/Generation";
import { Voice, IVoice } from "@/models/Voice";
import { PLANS } from "@/constants";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

/**
 * ==========================================
 * Usage Summary Interface
 * ==========================================
 */
export interface UsageSummary {
  charactersUsed: number;
  charactersLimit: number;
  charactersPercentage: number;
  generationsUsed: number;
  generationsLimit: number;
  generationsPercentage: number;
  periodStart: string;
  periodEnd: string;
  daysRemaining: number;
  daysElapsed: number;
  averageDaily: {
    characters: number;
    generations: number;
  };
  plan: "free" | "starter" | "creator" | "pro";
}

/**
 * ==========================================
 * Usage History Point Interface
 * ==========================================
 */
export interface UsageHistoryPoint {
  date: string;
  label: string;
  characters: number;
  generations: number;
}

/**
 * ==========================================
 * Voice Usage Interface
 * ==========================================
 */
export interface VoiceUsage {
  voiceId: string;
  voiceName: string;
  generations: number;
  characters: number;
  averageLength: number;
  percentage: number;
}

/**
 * ==========================================
 * Activity Item Interface
 * ==========================================
 */
export interface ActivityItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  characters: number;
  duration: number;
  createdAt: string;
  timeAgo: string;
}

/**
 * ==========================================
 * Complete Usage Data Interface
 * ==========================================
 */
export interface UsageData {
  summary: UsageSummary;
  history: UsageHistoryPoint[];
  byVoice: VoiceUsage[];
  recentActivity: ActivityItem[];
}

/**
 * ==========================================
 * Get Usage Summary
 * ==========================================
 */
export async function getUsageSummary(clerkId: string): Promise<UsageSummary> {
  const defaultSummary: UsageSummary = {
    charactersUsed: 0,
    charactersLimit: PLANS.free.maxChars,
    charactersPercentage: 0,
    generationsUsed: 0,
    generationsLimit: PLANS.free.maxGenerations,
    generationsPercentage: 0,
    periodStart: new Date().toISOString(),
    periodEnd: new Date().toISOString(),
    daysRemaining: 30,
    daysElapsed: 0,
    averageDaily: { characters: 0, generations: 0 },
    plan: "free",
  };

  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return defaultSummary;
  }

  try {
    await connectToDB();
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return defaultSummary;
    }

    const plan = user.plan || "free";
    const planLimits = PLANS[plan];

    // Calculate period dates (billing cycle: 1st of month to end of month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const daysElapsed = Math.max(1, Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const charactersUsed = user.usage?.charactersUsed || 0;
    const generationsUsed = user.usage?.generationsUsed || 0;

    return {
      charactersUsed,
      charactersLimit: planLimits.maxChars,
      charactersPercentage: Math.min(100, Math.round((charactersUsed / planLimits.maxChars) * 100)),
      generationsUsed,
      generationsLimit: planLimits.maxGenerations,
      generationsPercentage: Math.min(100, Math.round((generationsUsed / planLimits.maxGenerations) * 100)),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      daysRemaining,
      daysElapsed,
      averageDaily: {
        characters: Math.round(charactersUsed / daysElapsed),
        generations: Math.round((generationsUsed / daysElapsed) * 10) / 10,
      },
      plan,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[usageService] Failed to get usage summary:", error);
    return defaultSummary;
  }
}

/**
 * ==========================================
 * Get Usage History
 * ==========================================
 */
export async function getUsageHistory(
  clerkId: string,
  days: number = 7
): Promise<UsageHistoryPoint[]> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectToDB();
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return [];
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // Get all generations in the period
    const generations = await Generation.find({
      userId: user._id,
      createdAt: { $gte: startDate },
    }).lean<IGeneration[]>();

    // Group by date
    const historyMap = new Map<string, { characters: number; generations: number }>();

    // Initialize all days with zero
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      historyMap.set(dateKey, { characters: 0, generations: 0 });
    }

    // Aggregate generation data
    for (const gen of generations) {
      const dateKey = new Date(gen.createdAt).toISOString().split("T")[0];
      const existing = historyMap.get(dateKey) || { characters: 0, generations: 0 };
      historyMap.set(dateKey, {
        characters: existing.characters + (gen.text?.length || 0),
        generations: existing.generations + 1,
      });
    }

    // Convert to array with labels
    const history: UsageHistoryPoint[] = [];
    const sortedDates = Array.from(historyMap.keys()).sort();

    for (const dateKey of sortedDates) {
      const data = historyMap.get(dateKey)!;
      const date = new Date(dateKey);
      const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      history.push({
        date: dateKey,
        label,
        characters: data.characters,
        generations: data.generations,
      });
    }

    return history;
  } catch (error) {
    Sentry.captureException(error);
    console.error("[usageService] Failed to get usage history:", error);
    return [];
  }
}

/**
 * ==========================================
 * Get Usage By Voice
 * ==========================================
 */
export async function getUsageByVoice(clerkId: string): Promise<VoiceUsage[]> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectToDB();
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return [];
    }

    // Get all user's generations
    const generations = await Generation.find({ userId: user._id }).lean<IGeneration[]>();

    // Get all voices for name lookup
    const voices = await Voice.find({}).lean<IVoice[]>();
    const voiceMap = new Map(voices.map((v) => [v.voiceId, v.name]));

    // Group by voice
    const voiceUsageMap = new Map<string, { generations: number; characters: number; totalLength: number }>();

    for (const gen of generations) {
      const existing = voiceUsageMap.get(gen.voiceId) || { generations: 0, characters: 0, totalLength: 0 };
      voiceUsageMap.set(gen.voiceId, {
        generations: existing.generations + 1,
        characters: existing.characters + (gen.text?.length || 0),
        totalLength: existing.totalLength + (gen.length || 0),
      });
    }

    // Calculate total for percentages
    const totalGenerations = generations.length;

    // Convert to array
    const byVoice: VoiceUsage[] = [];
    for (const [voiceId, data] of voiceUsageMap) {
      byVoice.push({
        voiceId,
        voiceName: voiceMap.get(voiceId) || voiceId,
        generations: data.generations,
        characters: data.characters,
        averageLength: data.generations > 0 ? Math.round(data.characters / data.generations) : 0,
        percentage: totalGenerations > 0 ? Math.round((data.generations / totalGenerations) * 100) : 0,
      });
    }

    // Sort by generations descending
    byVoice.sort((a, b) => b.generations - a.generations);

    return byVoice;
  } catch (error) {
    Sentry.captureException(error);
    console.error("[usageService] Failed to get usage by voice:", error);
    return [];
  }
}

/**
 * ==========================================
 * Get Recent Activity
 * ==========================================
 */
export async function getRecentActivity(
  clerkId: string,
  limit: number = 10
): Promise<ActivityItem[]> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return [];
  }

  try {
    await connectToDB();
    const user = await getOrCreateUserWithMockData(clerkId);

    if (!user) {
      return [];
    }

    // Get recent generations
    const generations = await Generation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IGeneration[]>();

    // Get all voices for name lookup
    const voices = await Voice.find({}).lean<IVoice[]>();
    const voiceMap = new Map(voices.map((v) => [v.voiceId, v.name]));

    // Format time ago
    const getTimeAgo = (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return generations.map((gen) => ({
      id: gen._id.toString(),
      text: gen.text,
      voiceId: gen.voiceId,
      voiceName: voiceMap.get(gen.voiceId) || gen.voiceId,
      characters: gen.text?.length || 0,
      duration: gen.length || 0,
      createdAt: gen.createdAt.toISOString(),
      timeAgo: getTimeAgo(gen.createdAt),
    }));
  } catch (error) {
    Sentry.captureException(error);
    console.error("[usageService] Failed to get recent activity:", error);
    return [];
  }
}

/**
 * ==========================================
 * Get Complete Usage Data
 * ==========================================
 */
export async function getUsageData(
  clerkId: string,
  historyDays: number = 7
): Promise<UsageData> {
  const [summary, history, byVoice, recentActivity] = await Promise.all([
    getUsageSummary(clerkId),
    getUsageHistory(clerkId, historyDays),
    getUsageByVoice(clerkId),
    getRecentActivity(clerkId, 10),
  ]);

  return {
    summary,
    history,
    byVoice,
    recentActivity,
  };
}
