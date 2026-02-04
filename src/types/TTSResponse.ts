// src/types/TTSResponse.ts

/**
 * Represents the output returned from the TTS service
 */
export interface TTSResponse {
  generationId: string;   // ID of the generation record (MongoDB ObjectId)
  audioUrl: string;       // URL of the generated audio (Backblaze or streaming)
  length: number;         // Audio length in seconds
  charactersUsed: number; // Number of characters consumed
}
