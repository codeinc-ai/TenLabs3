import { currentUser } from "@clerk/nextjs/server";
import { getUsageData } from "@/lib/services/usageService";
import { UsageClient } from "./UsageClient";

/**
 * Usage Page
 *
 * Server component that fetches usage analytics data
 * and renders the usage client with charts and breakdowns.
 */
export default async function UsagePage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch usage data (default 7 days history)
  const usageData = clerkId
    ? await getUsageData(clerkId, 7)
    : {
        summary: {
          charactersUsed: 0,
          charactersLimit: 10000,
          charactersPercentage: 0,
          generationsUsed: 0,
          generationsLimit: 10,
          generationsPercentage: 0,
          periodStart: new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          daysRemaining: 30,
          daysElapsed: 0,
          averageDaily: { characters: 0, generations: 0 },
          plan: "free" as const,
        },
        history: [],
        byVoice: [],
        recentActivity: [],
      };

  return <UsageClient initialData={usageData} />;
}
