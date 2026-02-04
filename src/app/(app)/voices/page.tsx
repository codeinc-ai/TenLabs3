import { currentUser } from "@clerk/nextjs/server";
import { getVoices } from "@/lib/services/voiceService";
import { VoicesClient } from "./VoicesClient";

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

  return <VoicesClient initialData={initialData} />;
}
