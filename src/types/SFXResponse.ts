// src/types/SFXResponse.ts

/**
 * Represents the output from sound effect generation
 */
export interface SFXResponse {
  soundEffectId: string;
  text: string;
  durationSeconds: number;
  audioUrl: string;
}
