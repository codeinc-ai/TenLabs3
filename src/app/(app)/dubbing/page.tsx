import { currentUser } from "@clerk/nextjs/server";
import { DubbingClient } from "./DubbingClient";
import { getUserForDubbing } from "@/lib/services/dubbingPageService";

/**
 * Dubbing Page
 *
 * Server component that fetches user data and renders the Dubbing client.
 * Passes plan limits and current usage to enable proper validation.
 */
export default async function DubbingPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch user's plan and usage data
  const userData = clerkId ? await getUserForDubbing(clerkId) : null;

  return (
    <DubbingClient
      userId={clerkId}
      userPlan={userData?.plan ?? "free"}
      currentUsage={userData?.usage}
    />
  );
}
