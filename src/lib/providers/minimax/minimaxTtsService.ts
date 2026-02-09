// src/lib/providers/minimax/minimaxTtsService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { uploadAudioMp3ToBackblaze } from "@/lib/services/backblazeService";
import { MINIMAX_TTS_DEFAULTS } from "@/constants/minimax";

const MINIMAX_API_URL = "https://api.minimax.io/v1";

interface MinimaxTtsOptions {
  model?: string;
  speed?: number;
  volume?: number;
  pitch?: number;
  emotion?: string;
  format?: string;
}

interface MinimaxBaseResp {
  status_code: number;
  status_msg: string;
}

interface MinimaxTtsResponse {
  base_resp: MinimaxBaseResp;
  data: {
    audio: string;
    subtitle?: {
      audios?: Array<{
        audio_size: number;
        bitrate: number;
        channel: number;
        sample_rate: number;
      }>;
    };
  };
  extra_info?: {
    audio_length?: number;
    audio_sample_rate?: number;
    audio_size?: number;
    bitrate?: number;
    word_count?: number;
    invisible_character_ratio?: number;
    usage_characters?: number;
  };
  trace_id?: string;
}

interface MinimaxAsyncResponse {
  base_resp: MinimaxBaseResp;
  task_id: string;
  file_id?: string;
}

export type MinimaxAsyncTaskStatus = "Processing" | "Success" | "Failed" | "Expired";

interface MinimaxAsyncQueryResponse {
  base_resp: MinimaxBaseResp;
  status: MinimaxAsyncTaskStatus;
  file?: {
    file_id: string;
    download_url: string;
  };
}

interface GenerateSpeechResult {
  audioUrl: string;
  generationId: string;
  audioPath: string;
  audioFileId: string;
  duration?: number;
  characterCount?: number;
}

interface GenerateSpeechAsyncResult {
  taskId: string;
  fileId?: string;
}

function getMinimaxApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) {
    throw new Error("Missing MINIMAX_API_KEY environment variable");
  }
  return key;
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  userId: string,
  options: MinimaxTtsOptions = {}
): Promise<GenerateSpeechResult> {
  try {
    if (!text) {
      throw new Error("Text is required");
    }

    const apiKey = getMinimaxApiKey();
    const model = options.model ?? MINIMAX_TTS_DEFAULTS.model;

    // MiniMax v2 API does NOT support an "emotion" field in voice_setting.
    // Instead, we prepend an emotion instruction tag to the text so the model
    // adjusts its delivery accordingly.
    let processedText = text;
    if (options.emotion) {
      processedText = `[${options.emotion}] ${text}`;
    }

    const requestBody = {
      model,
      text: processedText,
      stream: false,
      output_format: "hex",
      voice_setting: {
        voice_id: voiceId,
        speed: options.speed ?? MINIMAX_TTS_DEFAULTS.speed,
        vol: options.volume ?? MINIMAX_TTS_DEFAULTS.volume,
        pitch: options.pitch ?? MINIMAX_TTS_DEFAULTS.pitch,
      },
      audio_setting: {
        sample_rate: MINIMAX_TTS_DEFAULTS.sampleRate,
        bitrate: MINIMAX_TTS_DEFAULTS.bitrate,
        format: options.format ?? MINIMAX_TTS_DEFAULTS.format,
        channel: MINIMAX_TTS_DEFAULTS.channel,
      },
      language_boost: MINIMAX_TTS_DEFAULTS.languageBoost,
    };

    // 30s timeout to avoid indefinite hangs
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(`${MINIMAX_API_URL}/t2a_v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        throw new Error("Minimax API request timed out after 30 seconds");
      }
      throw new Error(
        `Failed to connect to Minimax API: ${fetchError instanceof Error ? fetchError.message : "Network error"}`
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxTtsResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    const audioBuffer = Buffer.from(data.data.audio, "hex");

    const generationObjectId = new Types.ObjectId();
    const generationId = generationObjectId.toHexString();

    const upload = await uploadAudioMp3ToBackblaze({
      userId,
      generationId,
      audioBuffer,
    });

    return {
      audioUrl: upload.url,
      generationId,
      audioPath: upload.fileName,
      audioFileId: upload.fileId,
      duration: data.extra_info?.audio_length,
      characterCount: data.extra_info?.usage_characters ?? text.length,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "minimaxTtsService");
      scope.setTag("provider", "minimax");
      scope.setUser({ id: userId });
      scope.setContext("minimax_tts", {
        textLength: text?.length ?? 0,
        voiceId,
        model: options.model ?? MINIMAX_TTS_DEFAULTS.model,
      });
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function generateSpeechAsync(
  text: string,
  voiceId: string,
  options: MinimaxTtsOptions = {}
): Promise<GenerateSpeechAsyncResult> {
  try {
    if (!text) {
      throw new Error("Text is required");
    }

    const apiKey = getMinimaxApiKey();
    const model = options.model ?? MINIMAX_TTS_DEFAULTS.model;

    let processedText = text;
    if (options.emotion) {
      processedText = `[${options.emotion}] ${text}`;
    }

    const requestBody = {
      model,
      text: processedText,
      voice_setting: {
        voice_id: voiceId,
        speed: options.speed ?? MINIMAX_TTS_DEFAULTS.speed,
        vol: options.volume ?? MINIMAX_TTS_DEFAULTS.volume,
        pitch: options.pitch ?? MINIMAX_TTS_DEFAULTS.pitch,
      },
      audio_setting: {
        sample_rate: MINIMAX_TTS_DEFAULTS.sampleRate,
        bitrate: MINIMAX_TTS_DEFAULTS.bitrate,
        format: options.format ?? MINIMAX_TTS_DEFAULTS.format,
        channel: MINIMAX_TTS_DEFAULTS.channel,
      },
      language_boost: MINIMAX_TTS_DEFAULTS.languageBoost,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(`${MINIMAX_API_URL}/t2a_async_v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        throw new Error("Minimax async API request timed out after 30 seconds");
      }
      throw new Error(
        `Failed to connect to Minimax API: ${fetchError instanceof Error ? fetchError.message : "Network error"}`
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax async API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxAsyncResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax async API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    return {
      taskId: data.task_id,
      fileId: data.file_id,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "minimaxTtsService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "async");
      scope.setContext("minimax_tts_async", {
        textLength: text?.length ?? 0,
        voiceId,
      });
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function queryAsyncTask(
  taskId: string
): Promise<MinimaxAsyncQueryResponse> {
  try {
    const apiKey = getMinimaxApiKey();

    const response = await fetch(
      `${MINIMAX_API_URL}/query/t2a_async_query_v2?task_id=${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Minimax query API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MinimaxAsyncQueryResponse;

    if (data.base_resp.status_code !== 0) {
      throw new Error(
        `Minimax query API error (${data.base_resp.status_code}): ${data.base_resp.status_msg}`
      );
    }

    return data;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "minimaxTtsService");
      scope.setTag("provider", "minimax");
      scope.setTag("operation", "queryAsync");
      scope.setExtra("taskId", taskId);
      Sentry.captureException(error);
    });

    throw error;
  }
}
