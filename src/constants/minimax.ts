// src/constants/minimax.ts

export const MINIMAX_MODELS = [
  { id: "speech-2.8-hd", name: "Speech 2.8 HD", description: "Highest quality" },
  { id: "speech-2.8-turbo", name: "Speech 2.8 Turbo", description: "Fast generation" },
  { id: "speech-2.6-hd", name: "Speech 2.6 HD", description: "High quality" },
  { id: "speech-2.6-turbo", name: "Speech 2.6 Turbo", description: "Fast generation" },
] as const;

export const MINIMAX_DEFAULT_VOICES = [
  { id: "English_Graceful_Lady", name: "Graceful Lady", category: "Conversational" },
  { id: "English_Insightful_Speaker", name: "Insightful Speaker", category: "Narration" },
  { id: "English_radiant_girl", name: "Radiant Girl", category: "Social Media" },
  { id: "English_Persuasive_Man", name: "Persuasive Man", category: "Commercial" },
  { id: "English_expressive_narrator", name: "Expressive Narrator", category: "Narration" },
  { id: "English_Lucky_Robot", name: "Lucky Robot", category: "Characters" },
] as const;

export const MINIMAX_EMOTIONS = [
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "calm",
  "fluent",
] as const;

export const MINIMAX_TTS_DEFAULTS = {
  model: "speech-2.8-hd",
  speed: 1,
  volume: 1,
  pitch: 0,
  sampleRate: 32000,
  bitrate: 128000,
  format: "mp3",
  channel: 1,
  languageBoost: "auto",
};
