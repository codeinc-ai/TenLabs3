// src/constants/index.ts

/**
 * ==========================================
 * Plan Type
 * ==========================================
 */
export type PlanTier = "free" | "starter" | "creator" | "pro";

/**
 * ==========================================
 * Subscription Plans
 * ==========================================
 * Defines the limits and quotas for different user tiers.
 *
 * Free     – 5k credits/month
 * Starter  – 22k credits/month  ($9)
 * Creator  – 93k credits/month  ($22)
 * Pro      – 500k credits/month ($110)
 */
export const PLANS = {
  free: {
    maxCredits: 5000,
    maxChars: 5000,
    maxGenerations: 10,
    maxTranscriptionMinutes: 5,
    maxTranscriptions: 3,
    maxSoundEffects: 10,
    maxMusicGenerations: 3,
    maxVoiceConversions: 3,
    maxVoiceConversionMinutes: 3,
    maxVoiceIsolations: 3,
    maxVoiceIsolationMinutes: 3,
    maxDubbings: 2,
    maxDubbingMinutes: 5,
    maxDialogueGenerations: 5,
    maxDialogueCharacters: 3000,
    maxClonedVoices: 0,
    canUsePVC: false,
    maxStudioProjects: 3,
    commercialLicense: false,
    audioQuality: "128kbps" as const,
    supportTier: "community" as const,
    canAddFunds: true,
  },
  starter: {
    maxCredits: 22000,
    maxChars: 22000,
    maxGenerations: 50,
    maxTranscriptionMinutes: 30,
    maxTranscriptions: 15,
    maxSoundEffects: 100,
    maxMusicGenerations: 15,
    maxVoiceConversions: 15,
    maxVoiceConversionMinutes: 20,
    maxVoiceIsolations: 15,
    maxVoiceIsolationMinutes: 20,
    maxDubbings: 10,
    maxDubbingMinutes: 30,
    maxDialogueGenerations: 30,
    maxDialogueCharacters: 15000,
    maxClonedVoices: 3,
    canUsePVC: false,
    maxStudioProjects: 20,
    commercialLicense: true,
    audioQuality: "128kbps" as const,
    supportTier: "customer" as const,
    canAddFunds: true,
  },
  creator: {
    maxCredits: 93000,
    maxChars: 93000,
    maxGenerations: 200,
    maxTranscriptionMinutes: 90,
    maxTranscriptions: 50,
    maxSoundEffects: 300,
    maxMusicGenerations: 50,
    maxVoiceConversions: 50,
    maxVoiceConversionMinutes: 60,
    maxVoiceIsolations: 50,
    maxVoiceIsolationMinutes: 60,
    maxDubbings: 25,
    maxDubbingMinutes: 90,
    maxDialogueGenerations: 80,
    maxDialogueCharacters: 50000,
    maxClonedVoices: 10,
    canUsePVC: true,
    maxStudioProjects: 50,
    commercialLicense: true,
    audioQuality: "192kbps" as const,
    supportTier: "premium" as const,
    canAddFunds: true,
  },
  pro: {
    maxCredits: 500000,
    maxChars: 500000,
    maxGenerations: 1000,
    maxTranscriptionMinutes: 300,
    maxTranscriptions: 200,
    maxSoundEffects: 800,
    maxMusicGenerations: 250,
    maxVoiceConversions: 200,
    maxVoiceConversionMinutes: 200,
    maxVoiceIsolations: 200,
    maxVoiceIsolationMinutes: 200,
    maxDubbings: 100,
    maxDubbingMinutes: 300,
    maxDialogueGenerations: 300,
    maxDialogueCharacters: 200000,
    maxClonedVoices: 30,
    canUsePVC: true,
    maxStudioProjects: 200,
    commercialLicense: true,
    audioQuality: "44.1kHz PCM" as const,
    supportTier: "priority" as const,
    canAddFunds: true,
  },
} as const;

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
    price: { monthly: 0, yearly: 0 },
    features: [
      "5,000 credits per month",
      "Basic Text to Speech",
      "Limited Speech to Text",
      "10 Sound Effects per month",
      "3 Music generations per month",
      "3 projects in Studio",
      "Standard voices",
      "MP3 downloads",
      "Community support",
      "Add funds",
    ],
    limitations: [
      "No commercial use",
      "No voice cloning",
      "No priority support",
    ],
  },
  starter: {
    name: "Starter",
    description: "For individuals getting started",
    price: { monthly: 9, yearly: 86 },
    features: [
      "22,000 credits per month",
      "All Free features",
      "Commercial license",
      "Instant Voice Cloning",
      "20 projects in Studio",
      "100 Sound Effects per month",
      "15 Music generations per month",
      "Customer support",
      "Add funds",
    ],
    limitations: [],
  },
  creator: {
    name: "Creator",
    description: "For professionals and content creators",
    price: { monthly: 22, yearly: 211 },
    features: [
      "93,000 credits per month",
      "All Starter features",
      "Professional Voice Cloning",
      "192kbps quality audio",
      "50 projects in Studio",
      "300 Sound Effects per month",
      "50 Music generations per month",
      "Extra credit purchasing options",
      "Premium support",
    ],
    limitations: [],
  },
  pro: {
    name: "Pro",
    description: "For teams and power users",
    price: { monthly: 110, yearly: 1056 },
    features: [
      "500,000 credits per month",
      "All Creator features",
      "44.1kHz PCM audio output via API",
      "200 projects in Studio",
      "800 Sound Effects per month",
      "250 Music generations per month",
      "Priority support",
      "Add funds",
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
  // Default ElevenLabs model
  model: "eleven_multilingual_v2",
};

export const ELEVENLABS_MODELS = [
  { id: "eleven_multilingual_v2", name: "Eleven Multilingual v2", description: "Most expressive, multi-language" },
  { id: "eleven_turbo_v2_5", name: "Eleven Turbo v2.5", description: "Low latency, optimized" },
  { id: "eleven_turbo_v2", name: "Eleven Turbo v2", description: "Low latency" },
  { id: "eleven_monolingual_v1", name: "Eleven English v1", description: "English only" },
] as const;

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

/**
 * ==========================================
 * Voice Changer Configuration
 * ==========================================
 * Configuration for the voice changer (speech-to-speech) feature.
 */
export const VOICE_CHANGER_CONFIG = {
  // Maximum file size in megabytes
  maxFileSizeMB: 50,
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
  ],
  // Default ElevenLabs model for voice conversion
  defaultModel: "eleven_multilingual_sts_v2",
  // Available models
  models: [
    { id: "eleven_multilingual_sts_v2", name: "Eleven Multilingual v2" },
    { id: "eleven_english_sts_v2", name: "Eleven English v2" },
  ],
  // Default output format
  outputFormat: "mp3_44100_128",
  // Default voice settings
  defaults: {
    stability: 0.5,
    similarityBoost: 0.75,
    styleExaggeration: 0,
    removeBackgroundNoise: false,
    speakerBoost: true,
  },
};

/**
 * ==========================================
 * Voice Isolator Configuration
 * ==========================================
 * Configuration for the voice isolator (audio isolation) feature.
 */
export const VOICE_ISOLATOR_CONFIG = {
  // Maximum file size in megabytes
  maxFileSizeMB: 50,
  // Allowed audio file extensions
  allowedFormats: ["mp3", "wav", "m4a", "flac", "ogg", "webm", "mp4"],
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
  ],
};

/**
 * ==========================================
 * Dubbing Configuration
 * ==========================================
 * Configuration for the dubbing feature.
 */
export const DUBBING_CONFIG = {
  // Maximum file size in megabytes
  maxFileSizeMB: 1000,
  // Maximum duration in minutes
  maxDurationMinutes: 45,
  // Allowed audio/video file extensions
  allowedFormats: ["mp3", "wav", "m4a", "flac", "ogg", "webm", "mp4", "avi", "mov", "mkv"],
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
    "video/avi",
    "video/quicktime",
    "video/x-matroska",
  ],
  // Supported languages for dubbing
  supportedLanguages: [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "pl", name: "Polish" },
    { code: "tr", name: "Turkish" },
    { code: "ru", name: "Russian" },
    { code: "nl", name: "Dutch" },
    { code: "cs", name: "Czech" },
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese (Simplified)" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "hi", name: "Hindi" },
    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },
    { code: "ta", name: "Tamil" },
    { code: "fil", name: "Filipino" },
    { code: "uk", name: "Ukrainian" },
    { code: "el", name: "Greek" },
    { code: "bg", name: "Bulgarian" },
    { code: "ro", name: "Romanian" },
    { code: "sv", name: "Swedish" },
    { code: "hu", name: "Hungarian" },
    { code: "no", name: "Norwegian" },
    { code: "fi", name: "Finnish" },
    { code: "sk", name: "Slovak" },
    { code: "hr", name: "Croatian" },
    { code: "da", name: "Danish" },
  ],
};

/**
 * ==========================================
 * Text to Dialogue Configuration
 * ==========================================
 * Configuration for the text-to-dialogue feature.
 */
export const TEXT_TO_DIALOGUE_CONFIG = {
  // Maximum number of dialogue lines
  maxLines: 20,
  // Maximum characters per line
  maxCharsPerLine: 1000,
  // Maximum total characters
  maxTotalChars: 5000,
  // Output audio format
  outputFormat: "mp3_44100_128",
  // Emotion tags that can be used
  emotionTags: [
    "cheerfully",
    "sadly",
    "angrily",
    "excitedly",
    "nervously",
    "sarcastically",
    "whispering",
    "shouting",
    "stuttering",
    "laughing",
    "crying",
    "fearfully",
    "suspiciously",
    "lovingly",
    "tiredly",
  ],
};

/**
 * ==========================================
 * Professional Voice Clone Configuration
 * ==========================================
 * Configuration for the Professional Voice Clone (PVC) feature.
 */
export const PVC_CONFIG = {
  // Supported languages for PVC
  supportedLanguages: [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "pl", name: "Polish" },
    { code: "tr", name: "Turkish" },
    { code: "ru", name: "Russian" },
    { code: "nl", name: "Dutch" },
    { code: "cs", name: "Czech" },
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "hi", name: "Hindi" },
    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },
    { code: "ta", name: "Tamil" },
    { code: "fil", name: "Filipino" },
    { code: "uk", name: "Ukrainian" },
    { code: "el", name: "Greek" },
    { code: "bg", name: "Bulgarian" },
    { code: "ro", name: "Romanian" },
    { code: "sv", name: "Swedish" },
    { code: "hu", name: "Hungarian" },
    { code: "no", name: "Norwegian" },
    { code: "fi", name: "Finnish" },
    { code: "sk", name: "Slovak" },
    { code: "hr", name: "Croatian" },
    { code: "da", name: "Danish" },
  ],
  // Maximum number of audio samples
  maxSamples: 25,
  // Maximum file size per sample in bytes (50MB)
  maxSampleSize: 50 * 1024 * 1024,
  // Allowed audio/video file extensions
  allowedFormats: ["mp3", "wav", "m4a", "flac", "ogg", "webm", "mp4", "avi", "mov", "mkv"],
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
    "video/avi",
    "video/quicktime",
    "video/x-matroska",
  ],
  // Default training model
  trainingModel: "eleven_multilingual_v2",
  // Minimum audio duration for good quality clone (in seconds)
  minAudioDuration: 30,
  // Maximum audio duration per sample (in seconds)
  maxAudioDuration: 1800, // 30 minutes
  // Recommended total audio duration (in seconds)
  recommendedTotalDuration: 300, // 5 minutes minimum recommended
};
