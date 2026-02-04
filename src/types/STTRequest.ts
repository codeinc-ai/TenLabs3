// src/types/STTRequest.ts

/**
 * Represents the input for transcribing an audio file
 * Sent to the ElevenLabs Scribe API service
 */
export interface STTRequest {
  userId: string;              // ID of the user requesting transcription
  audioBuffer: Buffer;         // Audio file bytes
  fileName: string;            // Original file name
  language?: string;           // Optional ISO 639-1 language code (defaults to auto-detect)
  tagAudioEvents?: boolean;    // Tag laughter, applause, etc.
  keyterms?: string[];         // Up to 100 words to bias transcription
}
