// src/types/PVCTypes.ts

/**
 * Professional Voice Clone (PVC) Types
 */

export type PVCStatus =
  | "created"
  | "samples_uploaded"
  | "separating"
  | "speakers_ready"
  | "verifying"
  | "training"
  | "trained"
  | "failed";

export interface PVCVoice {
  voiceId: string;
  name: string;
  language: string;
  description?: string;
  status: PVCStatus;
  samples?: PVCSample[];
  verificationStatus?: "pending" | "verified" | "failed";
  trainingStatus?: PVCTrainingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PVCSample {
  sampleId: string;
  fileName: string;
  fileSize?: number;
  duration?: number;
  separationStatus: "pending" | "processing" | "completed" | "failed";
  speakers?: PVCSpeaker[];
  selectedSpeakerId?: string;
}

export interface PVCSpeaker {
  speakerId: string;
  audioBase64?: string;
  duration?: number;
}

export interface PVCTrainingStatus {
  state: "not_started" | "pending" | "training" | "fine_tuned" | "failed";
  progress?: number;
  modelId?: string;
  errorMessage?: string;
}

/**
 * Request/Response Types
 */

export interface CreatePVCRequest {
  name: string;
  language: string;
  description?: string;
}

export interface CreatePVCResponse {
  voiceId: string;
  name: string;
  language: string;
  description?: string;
}

export interface UploadSamplesResponse {
  samples: PVCSample[];
}

export interface SpeakerSeparationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  speakers?: PVCSpeaker[];
}

export interface SpeakerAudioResponse {
  audioBase64: string;
  mediaType: string;
}

export interface SelectSpeakerRequest {
  selectedSpeakerIds: string[];
}

export interface CaptchaResponse {
  captchaImage: string; // base64 encoded PNG
  text?: string; // The text to read (may not always be returned)
}

export interface TrainPVCRequest {
  modelId?: string; // defaults to eleven_multilingual_v2
}

export interface TrainingStatusResponse {
  state: "not_started" | "pending" | "training" | "fine_tuned" | "failed";
  progress?: number;
  modelId?: string;
}

/**
 * PVC Configuration
 */
export interface PVCLanguage {
  code: string;
  name: string;
}

export interface PVCConfig {
  supportedLanguages: PVCLanguage[];
  maxSamples: number;
  maxSampleSize: number; // in bytes
  supportedFormats: string[];
  trainingModel: string;
  minAudioDuration: number; // in seconds
  maxAudioDuration: number; // in seconds
}
