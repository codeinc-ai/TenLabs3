// src/types/TextToDialogueResponse.ts

import { DialogueInput } from "./TextToDialogueRequest";

/**
 * Represents the output from the text-to-dialogue service
 * Returned after successful dialogue generation
 */
export interface TextToDialogueResponse {
  dialogueId: string;                // MongoDB document ID
  title: string;                     // Dialogue title
  audioUrl: string;                  // URL to the generated audio
  inputs: DialogueInput[];           // Original dialogue inputs
  duration: number;                  // Audio duration in seconds
}
