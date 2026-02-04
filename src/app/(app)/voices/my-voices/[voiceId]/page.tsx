import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getVoiceById } from "@/lib/services/voiceService";
import { VoiceDetailClient } from "./VoiceDetailClient";

interface PageProps {
  params: Promise<{ voiceId: string }>;
}

/**
 * Voice Detail Page
 *
 * Server component that fetches voice details
 * and renders the voice detail client.
 */
export default async function VoiceDetailPage({ params }: PageProps) {
  const user = await currentUser();
  const clerkId = user?.id;

  if (!clerkId) {
    redirect("/sign-in");
  }

  const { voiceId } = await params;
  const voice = await getVoiceById(voiceId, clerkId);

  if (!voice) {
    notFound();
  }

  return <VoiceDetailClient voice={voice} />;
}
