import { currentUser } from "@clerk/nextjs/server";

import { STTClient } from "./STTClient";
import { getUserForSTT } from "@/lib/services/sttPageService";

/**
 * STT Page
 *
 * Server component that fetches user plan/usage data
 * and renders the Speech-to-Text client.
 */
export default async function STTPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  const userData = clerkId ? await getUserForSTT(clerkId) : null;

  return (
    <STTClient
      userPlan={userData?.plan ?? "free"}
      currentUsage={userData?.usage}
    />
  );
}
