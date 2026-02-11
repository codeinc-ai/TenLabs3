// src/lib/providers/types.ts

export type ProviderType = "elevenlabs" | "minimax" | "noiz";

export interface TTSRequest {
  text: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
  volume?: number;
  pitch?: number;
  emotion?: string;
  format?: string;
  provider: ProviderType;
  model?: string;
}

export interface TTSResponse {
  audioUrl: string;
  generationId: string;
  duration?: number;
  characterCount?: number;
}

export interface VoiceCloneRequest {
  name: string;
  files: File[];
  description?: string;
  provider: ProviderType;
  promptAudioFileId?: number;
  promptText?: string;
}

export interface VoiceCloneResponse {
  voiceId: string;
  name: string;
  previewAudioUrl?: string;
}

export interface VoiceDesignRequest {
  prompt: string;
  previewText: string;
  voiceId?: string;
  provider: ProviderType;
}

export interface VoiceDesignResponse {
  voiceId: string;
  previewAudioHex?: string;
  previewAudioUrl?: string;
}

export interface ProviderVoice {
  voiceId: string;
  name: string;
  description?: string;
  category?: string;
  provider: ProviderType;
}
