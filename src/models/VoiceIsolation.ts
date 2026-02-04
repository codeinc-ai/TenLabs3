// src/models/VoiceIsolation.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Voice Isolation Document Interface
 * ==========================================
 * Defines the TypeScript type for a voice isolation document.
 */
export interface IVoiceIsolation extends Document {
  userId: Types.ObjectId;           // Reference to the user who created this isolation
  originalFileName: string;         // User's uploaded file name
  originalAudioPath: string;        // Backblaze path to original audio
  originalAudioFileId?: string;     // Backblaze fileId for original (for deletion)
  isolatedAudioPath: string;        // Backblaze path to isolated audio
  isolatedAudioFileId?: string;     // Backblaze fileId for isolated (for deletion)
  duration: number;                 // Audio duration in seconds
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Voice Isolation Schema
 * ==========================================
 * Defines the MongoDB schema for storing voice isolations.
 */
const VoiceIsolationSchema: Schema = new Schema<IVoiceIsolation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalFileName: { type: String, required: true },
    originalAudioPath: { type: String, required: true },
    originalAudioFileId: { type: String },
    isolatedAudioPath: { type: String, required: true },
    isolatedAudioFileId: { type: String },
    duration: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based queries
VoiceIsolationSchema.index({ userId: 1, createdAt: -1 });

/**
 * ==========================================
 * Voice Isolation Model Export
 * ==========================================
 * Mongoose model to interact with the 'voiceisolations' collection.
 */
export const VoiceIsolation =
  mongoose.models.VoiceIsolation ||
  mongoose.model<IVoiceIsolation>("VoiceIsolation", VoiceIsolationSchema);
