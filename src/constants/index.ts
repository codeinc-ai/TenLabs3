// src/constants/index.ts

/**
 * ==========================================
 * Subscription Plans
 * ==========================================
 * Defines the limits and quotas for different user tiers.
 * You can add more plans (e.g., enterprise) here later.
 */
export const PLANS = {
  free: {
    // Maximum number of characters a user can generate per month
    maxChars: 10000,
    // Maximum number of TTS generations per month
    maxGenerations: 10,
    // Maximum transcription minutes per month
    maxTranscriptionMinutes: 10,
    // Maximum number of STT transcriptions per month
    maxTranscriptions: 5,
    // Maximum number of sound effect generations per month
    maxSoundEffects: 5,
  },
  pro: {
    maxChars: 50000,
    maxGenerations: 100,
    maxTranscriptionMinutes: 120,
    maxTranscriptions: 50,
    maxSoundEffects: 50,
  },
};

/**
 * ==========================================
 * Billing Plan Details
 * ==========================================
 * Extended plan information for billing pages.
 */
export const BILLING_PLANS = {
  free: {
    name: "Free",
    description: "Perfect for trying out the platform",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "10,000 characters per month",
      "10 generations per month",
      "10 minutes of transcription",
      "5 transcriptions per month",
      "Standard voices",
      "MP3 downloads",
      "Community support",
    ],
    limitations: [
      "No commercial use",
      "No priority support",
      "No API access",
    ],
  },
  pro: {
    name: "Pro",
    description: "For professionals and content creators",
    price: {
      monthly: 19,
      yearly: 190, // ~17% savings
    },
    features: [
      "50,000 characters per month",
      "100 generations per month",
      "120 minutes of transcription",
      "50 transcriptions per month",
      "All premium voices",
      "All audio formats",
      "Commercial license",
      "Priority support",
      "API access",
      "Voice cloning (coming soon)",
    ],
    limitations: [],
  },
};

/**
 * ==========================================
 * Default Voices
 * ==========================================
 * Predefined voices available for TTS.
 * Each voice has an 'id' used by the ElevenLabs API
 * and a human-readable 'name' for the UI.
 * Must match voices seeded in voiceService.ts
 */
export const DEFAULT_VOICES = [
  // Featured Voices (ElevenLabs voice_id values)
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", category: "Conversational" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", category: "Narration" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", category: "News" },
  // Regular Voices
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", category: "Commercial" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", category: "Educational" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", category: "Characters" },
  // Podcast Voices
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", category: "Podcast" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", category: "Podcast" },
  // Gaming Voices
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", category: "Gaming" },
  { id: "SOYHLrjzK2X1ezoPC6cr", name: "Harry", category: "Gaming" },
];

/**
 * ==========================================
 * Default TTS Settings
 * ==========================================
 * These are the default parameters sent to the ElevenLabs API
 * when generating speech. You can tweak these later.
 */
export const TTS_DEFAULTS = {
  // Stability controls consistency of voice output (0-1)
  stability: 0.5,
  // Similarity boost makes TTS closer to original voice (0-1)
  similarityBoost: 0.75,
  // Default audio format for generated speech
  format: "mp3",
};

/**
 * ==========================================
 * App-wide Configuration
 * ==========================================
 * General constraints and options for the app.
 * Easy to update in one place if limits or formats change.
 */
export const APP_CONFIG = {
  // Maximum text length allowed in a single TTS request
  maxTextLength: 40000,
  // Supported audio formats
  allowedFormats: ["mp3", "wav", "opus"],
};

/**
 * ==========================================
 * Speech-to-Text Configuration
 * ==========================================
 * Configuration for the STT (transcription) feature.
 */
export const STT_CONFIG = {
  // Maximum file size in megabytes
  maxFileSizeMB: 100,
  // Maximum audio duration in minutes
  maxDurationMinutes: 60,
  // Allowed audio file extensions
  allowedFormats: ["mp3", "wav", "m4a", "flac", "ogg", "webm"],
  // Allowed MIME types for upload validation
  allowedMimeTypes: [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/x-m4a",
    "audio/mp4",
    "audio/flac",
    "audio/ogg",
    "audio/webm",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  // ElevenLabs Scribe model
  model: "scribe_v1",
};

/**
 * ==========================================
 * Sound Effects Configuration
 * ==========================================
 * Configuration for the SFX (sound effects) feature.
 */
export const SFX_CONFIG = {
  // Maximum text prompt length
  maxPromptLength: 500,
  // Default duration in seconds (null = auto)
  defaultDuration: null as number | null,
  // Default prompt influence (0-1)
  defaultPromptInfluence: 0.3,
  // Minimum duration in seconds
  minDuration: 0.5,
  // Maximum duration in seconds
  maxDuration: 22,
};
