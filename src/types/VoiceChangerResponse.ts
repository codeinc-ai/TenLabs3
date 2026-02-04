// src/types/VoiceChangerResponse.ts

/**
 * Represents the output from the voice conversion service
 * Returned after successful speech-to-speech conversion
 */
export interface VoiceChangerResponse {
  conversionId: string;          // MongoDB document ID
  audioUrl: string;              // Proxy URL to the converted audio
  duration: number;              // Audio duration in seconds
  originalFileName: string;      // Original uploaded file name
  targetVoiceId: string;         // Voice ID that was used for conversion
  targetVoiceName?: string;      // Human-readable voice name
}
