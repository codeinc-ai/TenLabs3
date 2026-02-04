// src/types/VoiceIsolatorResponse.ts

/**
 * Represents the output from the voice isolation service
 * Returned after successful audio isolation
 */
export interface VoiceIsolatorResponse {
  isolationId: string;       // MongoDB document ID
  audioUrl: string;          // Proxy URL to the isolated audio
  duration: number;          // Audio duration in seconds
  originalFileName: string;  // Original uploaded file name
}
