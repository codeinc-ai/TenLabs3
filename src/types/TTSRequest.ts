// src/types/TTSRequest.ts

/**
 * Represents the input for generating a TTS audio file
 * Sent to the ElevenLabs API service
 */
export interface TTSRequest {
  userId: string;          // ID of the user requesting TTS
  text: string;            // Text to convert to speech
  voiceId: string;         // Selected voice ID
  stability?: number;      // Optional override of default stability
  similarityBoost?: number;// Optional override of default similarity
  format?: "mp3" | "wav" | "opus"; // Audio format
}
