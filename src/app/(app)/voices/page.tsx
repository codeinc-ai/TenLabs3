import { currentUser } from "@clerk/nextjs/server";
import { getVoices } from "@/lib/services/voiceService";
import { VoicesClient } from "./VoicesClient";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PLANS } from "@/constants";

/**
 * Voices Page
 *
 * Server component that fetches initial voice data
 * and renders the voices client.
 */
export default async function VoicesPage() {
  const user = await currentUser();
  const clerkId = user?.id ?? null;

  // Fetch initial voices
  const initialData = await getVoices(clerkId, { page: 1, limit: 12 });

  // Check if user can use PVC
  let canUsePVC = false;
  if (clerkId) {
    try {
      await connectToDB();
      const dbUser = await User.findOne({ clerkId }).lean();
      if (dbUser) {
        const userPlan = (dbUser as { plan?: string }).plan || "free";
        const planLimits = PLANS[userPlan as keyof typeof PLANS];
        canUsePVC = planLimits?.canUsePVC ?? false;
      }
    } catch (error) {
      // Silently fail - user just won't have PVC access
      console.error("Error checking PVC access:", error);
    }
  }

  return <VoicesClient initialData={initialData} canUsePVC={canUsePVC} />;
}
