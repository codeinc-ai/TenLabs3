import { currentUser } from "@clerk/nextjs/server";
import { VoiceIsolatorClient } from "./VoiceIsolatorClient";
import { getUserForVoiceIsolator } from "@/lib/services/voiceIsolatorPageService";

/**
 * Voice Isolator Page
 *
 * Server component that fetches user data and renders the Voice Isolator client.
 * Passes plan limits and current usage to enable proper validation.
 */
export default async function VoiceIsolatorPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch user's plan and usage data
  const userData = clerkId ? await getUserForVoiceIsolator(clerkId) : null;

  return (
    <VoiceIsolatorClient
      userPlan={userData?.plan ?? "free"}
      currentUsage={userData?.usage}
    />
  );
}
