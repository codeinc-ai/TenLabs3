import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getGenerationById } from "@/lib/services/generationService";
import { GenerationDetailClient } from "./GenerationDetailClient";

interface PageProps {
  params: Promise<{ generationId: string }>;
}

/**
 * Generation Details Page
 *
 * Server component that fetches a single generation
 * and renders the detail view.
 */
export default async function GenerationDetailsPage({ params }: PageProps) {
  const { generationId } = await params;
  const user = await currentUser();
  const clerkId = user?.id;

  if (!clerkId) {
    notFound();
  }

  const generation = await getGenerationById(clerkId, generationId);

  if (!generation) {
    notFound();
  }

  return <GenerationDetailClient generation={generation} />;
}
