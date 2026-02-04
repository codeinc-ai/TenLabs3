import { currentUser } from "@clerk/nextjs/server";
import { TTSClient } from "./TTSClient";
import { getUserForTTS } from "@/lib/services/ttsPageService";

/**
 * TTS Page
 *
 * Server component that fetches user data and renders the TTS client.
 * Passes plan limits and current usage to enable proper validation.
 */
export default async function TTSPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch user's plan and usage data
  const userData = clerkId ? await getUserForTTS(clerkId) : null;

  return (
    <TTSClient
      userPlan={userData?.plan ?? "free"}
      currentUsage={userData?.usage}
    />
  );
}
