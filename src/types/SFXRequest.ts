// src/types/SFXRequest.ts

/**
 * Represents the input for generating a sound effect
 * Sent to the ElevenLabs Sound Effects API
 */
export interface SFXRequest {
  userId: string;
  text: string;
  durationSeconds?: number;
  promptInfluence?: number;
}
