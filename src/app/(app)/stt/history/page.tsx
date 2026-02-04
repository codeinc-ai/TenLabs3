import { currentUser } from "@clerk/nextjs/server";

import { getTranscriptions } from "@/lib/services/transcriptionService";
import { HistoryClient } from "./HistoryClient";

export default async function STTHistoryPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  const initialData = clerkId
    ? await getTranscriptions(clerkId, 1, 10)
    : { transcriptions: [], total: 0, page: 1, limit: 10, totalPages: 0 };

  return <HistoryClient initialData={initialData} />;
}
