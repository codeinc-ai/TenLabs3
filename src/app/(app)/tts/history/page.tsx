import { currentUser } from "@clerk/nextjs/server";
import { getGenerations } from "@/lib/services/generationService";
import { HistoryClient } from "./HistoryClient";

/**
 * TTS History Page
 *
 * Server component that fetches user's generation history
 * and renders the history client.
 */
export default async function TTSHistoryPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch initial page of generations
  const initialData = clerkId
    ? await getGenerations(clerkId, 1, 10)
    : { generations: [], total: 0, page: 1, limit: 10, totalPages: 0 };

  return <HistoryClient initialData={initialData} />;
}
