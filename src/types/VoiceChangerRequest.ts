// src/types/VoiceChangerRequest.ts

/**
 * Represents the input for voice conversion (speech-to-speech)
 * Sent to the ElevenLabs Speech-to-Speech API
 */
export interface VoiceChangerRequest {
  userId: string;                // ID of the user requesting conversion
  audioBuffer: Buffer;           // Input audio file bytes
  fileName: string;              // Original file name
  targetVoiceId: string;         // Voice ID to convert to
  modelId?: string;              // Model ID (defaults to eleven_multilingual_sts_v2)
  stability?: number;            // Voice stability (0-1)
  similarityBoost?: number;      // Similarity boost (0-1)
  styleExaggeration?: number;    // Style exaggeration (0-1)
  removeBackgroundNoise?: boolean; // Remove background noise from input
  speakerBoost?: boolean;        // Boost speaker clarity
}
