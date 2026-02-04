// src/types/TextToDialogueRequest.ts

/**
 * Represents a single dialogue input with text and voice
 */
export interface DialogueInput {
  text: string;          // The text to speak (can include emotion tags like [cheerfully])
  voiceId: string;       // The voice ID to use for this line
  voiceName?: string;    // Optional voice name for display
}

/**
 * Represents the input for text-to-dialogue generation
 * Sent to the ElevenLabs Text to Dialogue API
 */
export interface TextToDialogueRequest {
  userId: string;                    // ID of the user requesting generation
  inputs: DialogueInput[];           // Array of dialogue inputs
  title?: string;                    // Optional title for the dialogue
}
