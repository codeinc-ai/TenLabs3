// src/models/DialogueGeneration.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Dialogue Input Subdocument Interface
 * ==========================================
 * Defines the TypeScript type for a single dialogue input.
 */
export interface IDialogueInput {
  text: string;
  voiceId: string;
  voiceName?: string;
}

/**
 * ==========================================
 * Dialogue Generation Document Interface
 * ==========================================
 * Defines the TypeScript type for a dialogue generation document.
 */
export interface IDialogueGeneration extends Document {
  userId: Types.ObjectId;           // Reference to the user who created this
  title: string;                    // Title of the dialogue
  inputs: IDialogueInput[];         // Array of dialogue inputs
  audioPath: string;                // Backblaze path to generated audio
  audioFileId?: string;             // Backblaze fileId for deletion
  duration: number;                 // Audio duration in seconds
  totalCharacters: number;          // Total characters generated
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Dialogue Input Subdocument Schema
 * ==========================================
 */
const DialogueInputSchema: Schema = new Schema<IDialogueInput>(
  {
    text: { type: String, required: true },
    voiceId: { type: String, required: true },
    voiceName: { type: String },
  },
  { _id: false }
);

/**
 * ==========================================
 * Dialogue Generation Schema
 * ==========================================
 * Defines the MongoDB schema for storing dialogue generations.
 */
const DialogueGenerationSchema: Schema = new Schema<IDialogueGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    inputs: { type: [DialogueInputSchema], required: true },
    audioPath: { type: String, required: true },
    audioFileId: { type: String },
    duration: { type: Number, default: 0 },
    totalCharacters: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based queries
DialogueGenerationSchema.index({ userId: 1, createdAt: -1 });

/**
 * ==========================================
 * Dialogue Generation Model Export
 * ==========================================
 * Mongoose model to interact with the 'dialoguegenerations' collection.
 */
export const DialogueGeneration =
  mongoose.models.DialogueGeneration ||
  mongoose.model<IDialogueGeneration>("DialogueGeneration", DialogueGenerationSchema);
