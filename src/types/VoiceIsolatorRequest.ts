// src/types/VoiceIsolatorRequest.ts

/**
 * Represents the input for voice isolation (audio isolation)
 * Sent to the ElevenLabs Audio Isolation API
 */
export interface VoiceIsolatorRequest {
  userId: string;           // ID of the user requesting isolation
  audioBuffer: Buffer;      // Input audio file bytes
  fileName: string;         // Original file name
}
