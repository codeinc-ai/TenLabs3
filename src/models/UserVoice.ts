// src/models/UserVoice.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * UserVoice Document Interface
 * ==========================================
 * Tracks which voices a user has saved to their collection.
 */
export interface IUserVoice extends Document {
  userId: string;
  voiceId: Types.ObjectId;
  isFavorite: boolean;
  addedAt: Date;
}

/**
 * ==========================================
 * UserVoice Schema
 * ==========================================
 */
const UserVoiceSchema: Schema = new Schema<IUserVoice>(
  {
    userId: { type: String, required: true, index: true },
    voiceId: { type: Schema.Types.ObjectId, ref: "Voice", required: true },
    isFavorite: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Compound index to ensure a user can only save a voice once
UserVoiceSchema.index({ userId: 1, voiceId: 1 }, { unique: true });

/**
 * ==========================================
 * UserVoice Model Export
 * ==========================================
 */
export const UserVoice =
  mongoose.models.UserVoice || mongoose.model<IUserVoice>("UserVoice", UserVoiceSchema);
