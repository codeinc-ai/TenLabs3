// src/constants/noiz.ts

export const NOIZ_API_BASE_URL = "https://noiz.ai/v1";

export const NOIZ_MODELS = [
  { id: "standard", name: "Standard", description: "Standard quality" },
  { id: "high", name: "High Quality", description: "Higher quality, slower" },
] as const;

export const NOIZ_DEFAULT_VOICES = [
  { id: "built-in-default", name: "Default Voice", category: "General" },
] as const;

export const NOIZ_VOICE_TYPES = ["custom", "built-in"] as const;

export const NOIZ_OUTPUT_FORMATS = ["wav", "mp3"] as const;

export const NOIZ_TTS_DEFAULTS = {
  qualityPreset: 1,
  speed: 1,
  outputFormat: "mp3",
  maxTextLength: 200,
};
