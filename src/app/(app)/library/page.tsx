import { currentUser } from "@clerk/nextjs/server";
import { getLibraryItems } from "@/lib/services/libraryService";
import { LibraryClient } from "./LibraryClient";

/**
 * Library Page
 *
 * Server component that fetches initial library data
 * and renders the library client.
 */
export default async function LibraryPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch initial library data
  const initialData = clerkId
    ? await getLibraryItems(clerkId, { page: 1, limit: 12 })
    : {
        items: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        stats: { totalItems: 0, totalFavorites: 0, voices: [] },
      };

  return <LibraryClient initialData={initialData} />;
}
