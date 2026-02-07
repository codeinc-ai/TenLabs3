// src/models/MusicGeneration.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * MusicGeneration Document Interface
 * ==========================================
 * Defines the TypeScript type for a music generation document.
 */
export interface IMusicGeneration extends Document {
  userId: Types.ObjectId;
  prompt: string;
  lyrics?: string;
  audioPath: string;
  audioUrl: string;
  audioFileId?: string;
  durationMs: number;
  forceInstrumental: boolean;
  isFavorite: boolean;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * MusicGeneration Schema
 * ==========================================
 * Defines the MongoDB schema for storing music generations.
 */
const MusicGenerationSchema: Schema = new Schema<IMusicGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    lyrics: { type: String },
    audioPath: { type: String, required: true },
    audioUrl: { type: String, required: true },
    audioFileId: { type: String },
    durationMs: { type: Number, default: 0 },
    forceInstrumental: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    provider: { type: String, default: "elevenlabs" },
  },
  {
    timestamps: true,
  }
);

/**
 * ==========================================
 * MusicGeneration Model Export
 * ==========================================
 * Mongoose model to interact with the 'musicgenerations' collection.
 */
export const MusicGeneration =
  mongoose.models.MusicGeneration ||
  mongoose.model<IMusicGeneration>("MusicGeneration", MusicGenerationSchema);
