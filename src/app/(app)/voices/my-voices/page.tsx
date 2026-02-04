import { currentUser } from "@clerk/nextjs/server";
import { getMyVoices } from "@/lib/services/voiceService";
import { MyVoicesClient } from "./MyVoicesClient";

/**
 * My Voices Page
 *
 * Server component that fetches user's saved voices
 * and renders the my voices client.
 */
export default async function MyVoicesPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch user's saved voices
  const voices = clerkId ? await getMyVoices(clerkId) : [];

  return <MyVoicesClient initialVoices={voices} />;
}
