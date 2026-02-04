import { currentUser } from "@clerk/nextjs/server";
import { TextToDialogueClient } from "./TextToDialogueClient";
import { getUserForTextToDialogue } from "@/lib/services/textToDialoguePageService";

/**
 * Text to Dialogue Page
 *
 * Server component that fetches user data and renders the client.
 * Passes plan limits and current usage to enable proper validation.
 */
export default async function TextToDialoguePage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch user's plan and usage data
  const userData = clerkId ? await getUserForTextToDialogue(clerkId) : null;

  return (
    <TextToDialogueClient
      userId={clerkId}
      userPlan={userData?.plan ?? "free"}
      currentUsage={userData?.usage}
    />
  );
}
