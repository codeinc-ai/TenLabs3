// src/types/DubbingRequest.ts

/**
 * Represents the input for dubbing audio/video
 * Sent to the ElevenLabs Dubbing API
 */
export interface DubbingRequest {
  userId: string;                  // ID of the user requesting dubbing
  audioBuffer: Buffer;             // Input audio/video file bytes
  fileName: string;                // Original file name
  projectName?: string;            // Optional project name
  sourceLanguage?: string;         // Source language code (auto-detect if not provided)
  targetLanguages: string[];       // Array of target language codes
  numSpeakers?: number;            // Number of speakers (auto-detect if not provided)
  startTime?: number;              // Start time in seconds for partial dubbing
  endTime?: number;                // End time in seconds for partial dubbing
  watermark?: boolean;             // Add watermark to output
  highestResolution?: boolean;     // Use highest resolution
}
