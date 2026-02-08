/**
 * Typed PostHog event contracts.
 *
 * Notes:
 * - Avoid PII: do NOT include raw TTS text.
 * - Prefer stable identifiers: Clerk userId is used as distinctId.
 */

export type PlanType = "free" | "starter" | "creator" | "pro";

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
  provider?: string;
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
  provider?: "elevenlabs" | "minimax";
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

export interface VoiceIsolationCompletedEvent {
  feature: "voice-isolator";
  userId?: string;
}

export interface VoiceIsolationFailedEvent {
  feature: "voice-isolator";
  userId?: string;
  error: string;
}

export interface VoiceIsolationCreatedEvent {
  feature: "voice-isolator";
  userId: string;
  plan: PlanType;
  isolationId: string;
  durationSeconds: number;
  fileExtension: string;
  fileSizeMB: number;
}

export interface VoiceIsolationDeletedEvent {
  feature: "voice-isolator";
  userId: string;
  isolationId: string;
}

export interface DubbingCreatedEvent {
  feature: "dubbing";
  userId: string;
  plan: PlanType;
  projectId: string;
  dubbingId: string;
  durationSeconds: number;
  targetLanguages: string;
  fileExtension: string;
  fileSizeMB: number;
}

export interface DubbingCompletedEvent {
  feature: "dubbing";
  userId?: string;
  projectId: string;
}

export interface DubbingFailedEvent {
  feature: "dubbing";
  userId?: string;
  projectId?: string;
  error: string;
}

export interface DialogueGeneratedEvent {
  feature: "text-to-dialogue";
  userId: string;
  plan: PlanType;
  dialogueId: string;
  totalCharacters: number;
  lineCount: number;
  durationSeconds: number;
}

export interface DialogueDeletedEvent {
  feature: "text-to-dialogue";
  userId: string;
  dialogueId: string;
}

// Professional Voice Clone (PVC) Events

export interface PVCCreatedEvent {
  feature: "pvc";
  userId: string;
  plan: PlanType;
  voiceId: string;
  language: string;
}

export interface PVCSamplesUploadedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
  sampleCount: number;
  totalSizeMB: number;
}

export interface PVCVerificationStartedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
}

export interface PVCVerificationCompletedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
}

export interface PVCVerificationFailedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
  error: string;
}

export interface PVCTrainingStartedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
  modelId: string;
}

export interface PVCTrainingCompletedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
  modelId: string;
  durationMinutes?: number;
}

export interface PVCTrainingFailedEvent {
  feature: "pvc";
  userId: string;
  voiceId: string;
  error: string;
}

export interface MusicGeneratedEvent {
  feature: "music";
  userId: string;
  plan: PlanType;
  generationId: string;
  durationMs: number;
  forceInstrumental: boolean;
  promptLength: number;
  provider: string;
}

export interface UsageLimitHitEvent {
  feature: "tts" | "stt" | "sfx" | "voice-changer" | "voice-isolator" | "dubbing" | "text-to-dialogue" | "pvc";
  userId: string;
  plan: PlanType;
  limitType: "characters" | "generations" | "transcriptions" | "transcription_minutes" | "sound_effects" | "voice_conversions" | "voice_conversion_minutes" | "voice_isolations" | "voice_isolation_minutes" | "dubbings" | "dubbing_minutes" | "dialogue_generations" | "dialogue_characters" | "cloned_voices" | "pvc_access";
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
  voice_isolation_completed: VoiceIsolationCompletedEvent;
  voice_isolation_failed: VoiceIsolationFailedEvent;
  voice_isolation_created: VoiceIsolationCreatedEvent;
  voice_isolation_deleted: VoiceIsolationDeletedEvent;
  dubbing_created: DubbingCreatedEvent;
  dubbing_completed: DubbingCompletedEvent;
  dubbing_failed: DubbingFailedEvent;
  dialogue_generated: DialogueGeneratedEvent;
  dialogue_deleted: DialogueDeletedEvent;
  pvc_created: PVCCreatedEvent;
  pvc_samples_uploaded: PVCSamplesUploadedEvent;
  pvc_verification_started: PVCVerificationStartedEvent;
  pvc_verification_completed: PVCVerificationCompletedEvent;
  pvc_verification_failed: PVCVerificationFailedEvent;
  pvc_training_started: PVCTrainingStartedEvent;
  pvc_training_completed: PVCTrainingCompletedEvent;
  pvc_training_failed: PVCTrainingFailedEvent;
  music_generated: MusicGeneratedEvent;
  usage_limit_hit: UsageLimitHitEvent;
  billing_event: BillingEvent;
};

export type PostHogEventName = keyof PostHogEventPropertiesMap;
