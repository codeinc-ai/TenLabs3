// src/lib/providers/minimax/minimaxVoiceService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";

import type { ProviderVoice } from "@/lib/providers/types";

const MINIMAX_API_URL = "https://api.minimax.io/v1";

type MinimaxVoiceType = "all" | "system_voice" | "voice_cloning" | "voice_generation";

interface MinimaxBaseResp {
  status_code: number;
  status_msg: string;
}

interface MinimaxVoiceEntry {
  voice_id: string;
  name: string;
  description?: string;
}

interface MinimaxGetVoicesResponse {
  base_resp: MinimaxBaseResp;
  system_voice?: MinimaxVoiceEntry[];
  voice_cloning?: MinimaxVoiceEntry[];
  voice_generation?: MinimaxVoiceEntry[];
}

interface MinimaxDeleteVoiceResponse {
  base_resp: MinimaxBaseResp;
}

interface MinimaxCloneVoiceOptions {
  clonePrompt?: string;
  text?: string;
  model?: string;
}

interface MinimaxCloneVoiceResponse {
  base_resp: MinimaxBaseResp;
  voice_id: string;
}

interface MinimaxFileUploadResponse {
  base_resp: MinimaxBaseResp;
  file: {
    file_id: number;
    filename: string;
    bytes: number;
    created_at: number;
    purpose: string;
  };
}

interface MinimaxVoiceDesignResponse {
  base_resp: MinimaxBaseResp;
  voice_id: string;
  trial_audio: string;
}

function getMinimaxApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) {
    throw new Error("Missing MINIMAX_API_KEY environment variable");
  }
  return key;
}

function mapToProviderVoice(entry: MinimaxVoiceEntry, category?: string): ProviderVoice {
  return {
    voiceId: entry.voice_id,
    name: entry.name,
    description: entry.description,
    category,
    provider: "minimax",
  };
}

export async function getVoices(
  voiceType: MinimaxVoiceType = "all"
): Promise<ProviderVoice[]> {
  try {
    const apiKey = getMinimaxApiKey();

    const response = await fetch(`${MINIMAX_API_URL}/get_voice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ voice_type: voiceType }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax get_voice API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxGetVoicesResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax get_voice API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    const voices: ProviderVoice[] = [];

    if (data.system_voice) {
      for (const entry of data.system_voice) {
        voices.push(mapToProviderVoice(entry, "System"));
      }
    }

    if (data.voice_cloning) {
      for (const entry of data.voice_cloning) {
        voices.push(mapToProviderVoice(entry, "Cloned"));
      }
    }

    if (data.voice_generation) {
      for (const entry of data.voice_generation) {
        voices.push(mapToProviderVoice(entry, "Designed"));
      }
    }

    return voices;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voices");
      scope.setTag("service", "minimaxVoiceService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "getVoices");
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function deleteVoice(
  voiceId: string,
  voiceType: "voice_cloning" | "voice_generation"
): Promise<void> {
  try {
    const apiKey = getMinimaxApiKey();

    const response = await fetch(`${MINIMAX_API_URL}/delete_voice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        voice_type: voiceType,
        voice_id: voiceId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax delete_voice API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxDeleteVoiceResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax delete_voice API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voices");
      scope.setTag("service", "minimaxVoiceService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "deleteVoice");
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("voiceType", voiceType);
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function cloneVoice(
  fileId: number,
  voiceId: string,
  options: MinimaxCloneVoiceOptions = {}
): Promise<string> {
  try {
    const apiKey = getMinimaxApiKey();

    const requestBody: Record<string, unknown> = {
      file_id: fileId,
      voice_id: voiceId,
    };

    if (options.clonePrompt) {
      requestBody.clone_prompt = options.clonePrompt;
    }
    if (options.text) {
      requestBody.text = options.text;
    }
    if (options.model) {
      requestBody.model = options.model;
    }

    const response = await fetch(`${MINIMAX_API_URL}/voice_clone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax voice_clone API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxCloneVoiceResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax voice_clone API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    return data.voice_id;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-cloning");
      scope.setTag("service", "minimaxVoiceService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "cloneVoice");
      scope.setExtra("fileId", fileId);
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadAudioForCloning(file: File): Promise<number> {
  try {
    const apiKey = getMinimaxApiKey();

    const formData = new FormData();
    formData.append("purpose", "voice_clone");
    formData.append("file", file);

    const response = await fetch(`${MINIMAX_API_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax file upload API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxFileUploadResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax file upload API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    return data.file.file_id;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-cloning");
      scope.setTag("service", "minimaxVoiceService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "uploadAudioForCloning");
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadPromptAudio(file: File): Promise<number> {
  try {
    const apiKey = getMinimaxApiKey();

    const formData = new FormData();
    formData.append("purpose", "prompt_audio");
    formData.append("file", file);

    const response = await fetch(`${MINIMAX_API_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax prompt audio upload API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxFileUploadResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax prompt audio upload API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    return data.file.file_id;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-cloning");
      scope.setTag("service", "minimaxVoiceService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "uploadPromptAudio");
      Sentry.captureException(error);
    });

    throw error;
  }
}

interface VoiceDesignResult {
  voiceId: string;
  trialAudioHex: string;
}

export async function designVoice(
  prompt: string,
  previewText: string,
  voiceId?: string
): Promise<VoiceDesignResult> {
  try {
    const apiKey = getMinimaxApiKey();

    const requestBody: Record<string, string> = {
      prompt,
      preview_text: previewText,
    };

    if (voiceId) {
      requestBody.voice_id = voiceId;
    }

    const response = await fetch(`${MINIMAX_API_URL}/voice_design`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax voice_design API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxVoiceDesignResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax voice_design API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    return {
      voiceId: data.voice_id,
      trialAudioHex: data.trial_audio,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-design");
      scope.setTag("service", "minimaxVoiceService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "designVoice");
      Sentry.captureException(error);
    });

    throw error;
  }
}
