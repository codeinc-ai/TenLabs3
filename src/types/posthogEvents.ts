/**
 * Typed PostHog event contracts.
 *
 * Notes:
 * - Avoid PII: do NOT include raw TTS text.
 * - Prefer stable identifiers: Clerk userId is used as distinctId.
 */

export type PlanType = "free" | "pro";

export interface PageViewEvent {
  feature: "navigation";
  /** Human-friendly page name (kept simple for now). */
  pageName: string;
  /** Route path (exclude query string to avoid leaking user-entered data). */
  route: string;
  /** Optional because some pages may be public. */
  userId?: string;
}

export interface VoiceSelectedEvent {
  feature: "tts";
  userId: string;
  voiceId: string;
}

export interface TtsGeneratedEvent {
  feature: "tts";
  userId: string;
  generationId: string;
  textLength: number;
  voiceId: string;
}

export interface AudioPlayedEvent {
  feature: "tts";
  userId: string;
  generationId: string;
}

export interface AudioDownloadedEvent {
  feature: "tts";
  userId: string;
  generationId: string;
}

export interface GenerationDeletedEvent {
  feature: "tts";
  userId: string;
  generationId: string;
}

export interface GenerationCreatedEvent {
  feature: "tts";
  userId: string;
  generationId: string;
  charactersUsed: number;
  voiceId: string;
  plan: PlanType;
}

export interface TranscriptionCreatedEvent {
  feature: "stt";
  userId: string;
  plan: PlanType;
  transcriptionId: string;
  durationSeconds: number;
  language: string;
  fileExtension: string;
  fileSizeMB: number;
}

export interface TranscriptionDeletedEvent {
  feature: "stt";
  userId: string;
  transcriptionId: string;
}

export interface SoundEffectCreatedEvent {
  feature: "sfx";
  userId: string;
  plan: PlanType;
  soundEffectId: string;
  durationSeconds: number;
  promptLength: number;
}

export interface SoundEffectDeletedEvent {
  feature: "sfx";
  userId: string;
  soundEffectId: string;
}

export interface VoiceConversionCompletedEvent {
  feature: "voice-changer";
  userId?: string;
  voiceId: string;
  modelId: string;
}

export interface VoiceConversionFailedEvent {
  feature: "voice-changer";
  userId?: string;
  error: string;
}

export interface VoiceConversionCreatedEvent {
  feature: "voice-changer";
  userId: string;
  plan: PlanType;
  conversionId: string;
  durationSeconds: number;
  targetVoiceId: string;
  targetVoiceName: string;
  modelId: string;
  fileExtension: string;
  fileSizeMB: number;
}

export interface VoiceConversionDeletedEvent {
  feature: "voice-changer";
  userId: string;
  conversionId: string;
}

export interface UsageLimitHitEvent {
  feature: "tts" | "stt" | "sfx" | "voice-changer";
  userId: string;
  plan: PlanType;
  limitType: "characters" | "generations" | "transcriptions" | "transcription_minutes" | "sound_effects" | "voice_conversions" | "voice_conversion_minutes";
  attempted: number;
  limit: number;
}

/** Future placeholder event type (intentionally unused for now). */
export interface BillingEvent {
  feature: "billing";
  userId: string;
  action: string;
  plan?: PlanType;
}

export type PostHogEventPropertiesMap = {
  page_view: PageViewEvent;
  voice_selected: VoiceSelectedEvent;
  tts_generated: TtsGeneratedEvent;
  audio_played: AudioPlayedEvent;
  audio_downloaded: AudioDownloadedEvent;
  generation_created: GenerationCreatedEvent;
  generation_deleted: GenerationDeletedEvent;
  transcription_created: TranscriptionCreatedEvent;
  transcription_deleted: TranscriptionDeletedEvent;
  sound_effect_created: SoundEffectCreatedEvent;
  sound_effect_deleted: SoundEffectDeletedEvent;
  voice_conversion_completed: VoiceConversionCompletedEvent;
  voice_conversion_failed: VoiceConversionFailedEvent;
  voice_conversion_created: VoiceConversionCreatedEvent;
  voice_conversion_deleted: VoiceConversionDeletedEvent;
  usage_limit_hit: UsageLimitHitEvent;
  billing_event: BillingEvent;
};

export type PostHogEventName = keyof PostHogEventPropertiesMap;
