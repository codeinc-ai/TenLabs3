import { currentUser } from "@clerk/nextjs/server";
import { VoiceChangerClient } from "./VoiceChangerClient";
import { getUserForVoiceChanger } from "@/lib/services/voiceChangerPageService";

/**
 * Voice Changer Page
 *
 * Server component that fetches user data and renders the Voice Changer client.
 * Passes plan limits and current usage to enable proper validation.
 */
export default async function VoiceChangerPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch user's plan and usage data
  const userData = clerkId ? await getUserForVoiceChanger(clerkId) : null;

  return (
    <VoiceChangerClient
      userPlan={userData?.plan ?? "free"}
      currentUsage={userData?.usage}
    />
  );
}
