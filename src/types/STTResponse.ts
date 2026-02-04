// src/types/STTResponse.ts

/**
 * Represents the output returned from the STT service
 */
export interface STTResponse {
  transcriptionId: string;     // ID of the transcription record (MongoDB ObjectId)
  text: string;                // Transcribed text
  language: string;            // Detected/specified language code
  duration: number;            // Audio duration in seconds
  audioUrl: string;            // Proxy URL to original audio
}
