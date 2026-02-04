// src/lib/services/sttPageService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";

import { connectToDB } from "@/lib/mongodb";
import { getOrCreateUserWithMockData } from "@/lib/services/seedService";

export interface STTPageUserData {
  plan: "free" | "pro";
  usage: {
    transcriptionMinutesUsed: number;
    transcriptionsUsed: number;
  };
}

function getDefaultUserData(): STTPageUserData {
  return {
    plan: "free",
    usage: {
      transcriptionMinutesUsed: 0,
      transcriptionsUsed: 0,
    },
  };
}

export async function getUserForSTT(clerkId: string): Promise<STTPageUserData> {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return getDefaultUserData();
  }

  try {
    await connectToDB();

    const user = await getOrCreateUserWithMockData(clerkId);
    if (!user) {
      return getDefaultUserData();
    }

    return {
      plan: user.plan || "free",
      usage: {
        transcriptionMinutesUsed: user.usage?.transcriptionMinutesUsed || 0,
        transcriptionsUsed: user.usage?.transcriptionsUsed || 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "sttPageService");
      scope.setExtra("clerkId", clerkId);
      Sentry.captureException(error);
    });

    return getDefaultUserData();
  }
}
