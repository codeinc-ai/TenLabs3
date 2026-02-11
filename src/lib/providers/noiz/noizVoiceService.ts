// src/lib/providers/noiz/noizVoiceService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";

import type { ProviderVoice } from "@/lib/providers/types";

const NOIZ_API_URL = "https://noiz.ai/v1";

interface NoizVoice {
  id: number;
  voice_id: string;
  display_name: string;
  voice_type: string;
  labels: string;
  sample: string | null;
  meta: { text: string };
  url: string;
  create_time: number;
}

interface NoizBaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface NoizVoiceListData {
  total_count: number;
  voices: NoizVoice[];
}

interface NoizUploadVoiceData {
  voice_id: string;
  voice_display_name: string;
  duration: number;
  text: string;
  language: string;
}

interface NoizDeleteVoiceData {
  voice_id: string;
  display_name: string;
  delete_time: number;
}

function getNoizApiKey(): string {
  const key = process.env.NOIZ_API_KEY;
  if (!key) {
    throw new Error("Missing NOIZ_API_KEY environment variable");
  }
  return key;
}

function mapToProviderVoice(voice: NoizVoice): ProviderVoice {
  return {
    voiceId: voice.voice_id,
    name: voice.display_name,
    description: voice.labels,
    category: voice.voice_type,
    provider: "noiz" as ProviderVoice["provider"],
  };
}

export async function getVoices(
  voiceType?: "custom" | "built-in",
  keyword?: string,
  skip?: number,
  limit?: number
): Promise<ProviderVoice[]> {
  try {
    const apiKey = getNoizApiKey();

    const params = new URLSearchParams();
    if (voiceType) params.set("voice_type", voiceType);
    if (keyword) params.set("keyword", keyword);
    if (skip !== undefined) params.set("skip", String(skip));
    if (limit !== undefined) params.set("limit", String(limit));

    const queryString = params.toString();
    const url = `${NOIZ_API_URL}/voices${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Noiz voices API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as NoizBaseResponse<NoizVoiceListData>;

    if (data.code !== 0) {
      throw new Error(`Noiz voices API error (${data.code}): ${data.message}`);
    }

    return data.data.voices.map(mapToProviderVoice);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voices");
      scope.setTag("service", "noizVoiceService");
      scope.setTag("provider", "noiz");
      scope.setTag("operation", "getVoices");
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function getVoiceDetails(voiceId: string): Promise<NoizVoice> {
  try {
    const apiKey = getNoizApiKey();

    const response = await fetch(`${NOIZ_API_URL}/voices/${voiceId}`, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Noiz voice details API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as NoizBaseResponse<NoizVoice>;

    if (data.code !== 0) {
      throw new Error(`Noiz voice details API error (${data.code}): ${data.message}`);
    }

    return data.data;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voices");
      scope.setTag("service", "noizVoiceService");
      scope.setTag("provider", "noiz");
      scope.setTag("operation", "getVoiceDetails");
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function deleteVoice(
  voiceId: string
): Promise<{ voiceId: string; displayName: string; deleteTime: number }> {
  try {
    const apiKey = getNoizApiKey();

    const response = await fetch(`${NOIZ_API_URL}/voices/${voiceId}`, {
      method: "DELETE",
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Noiz delete voice API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as NoizBaseResponse<NoizDeleteVoiceData>;

    if (data.code !== 0) {
      throw new Error(`Noiz delete voice API error (${data.code}): ${data.message}`);
    }

    return {
      voiceId: data.data.voice_id,
      displayName: data.data.display_name,
      deleteTime: data.data.delete_time,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voices");
      scope.setTag("service", "noizVoiceService");
      scope.setTag("provider", "noiz");
      scope.setTag("operation", "deleteVoice");
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadVoice(
  file: Buffer,
  fileName: string,
  displayName?: string,
  denoise?: boolean
): Promise<NoizUploadVoiceData> {
  try {
    const apiKey = getNoizApiKey();

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: "audio/mpeg" });
    formData.append("file", blob, fileName);
    if (displayName) formData.append("display_name", displayName);
    if (denoise !== undefined) formData.append("denoise", String(denoise));

    const response = await fetch(`${NOIZ_API_URL}/voices`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Noiz upload voice API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as NoizBaseResponse<NoizUploadVoiceData>;

    if (data.code !== 0) {
      throw new Error(`Noiz upload voice API error (${data.code}): ${data.message}`);
    }

    return data.data;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-cloning");
      scope.setTag("service", "noizVoiceService");
      scope.setTag("provider", "noiz");
      scope.setTag("operation", "uploadVoice");
      Sentry.captureException(error);
    });

    throw error;
  }
}
