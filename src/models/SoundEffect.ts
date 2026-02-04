// src/models/SoundEffect.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * SoundEffect Document Interface
 * ==========================================
 * Defines the TypeScript type for a sound effect generation document.
 */
export interface ISoundEffect extends Document {
  userId: Types.ObjectId;
  text: string;
  audioPath: string;
  audioUrl: string;
  audioFileId?: string;
  durationSeconds: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * SoundEffect Schema
 * ==========================================
 * Defines the MongoDB schema for storing sound effects.
 */
const SoundEffectSchema: Schema = new Schema<ISoundEffect>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    audioPath: { type: String, required: true },
    audioUrl: { type: String, required: true },
    audioFileId: { type: String },
    durationSeconds: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

/**
 * ==========================================
 * SoundEffect Model Export
 * ==========================================
 * Mongoose model to interact with the 'soundeffects' collection.
 */
export const SoundEffect =
  mongoose.models.SoundEffect ||
  mongoose.model<ISoundEffect>("SoundEffect", SoundEffectSchema);
