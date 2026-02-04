// src/models/Voice.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * ==========================================
 * Voice Document Interface
 * ==========================================
 * Defines the TypeScript type for a voice in the app.
 */
export interface IVoice extends Document {
  name: string;
  voiceId: string;
  userId?: string;
  isDefault: boolean;
  description?: string;
  gender?: "male" | "female" | "neutral";
  age?: "young" | "middle" | "old";
  category?: string;
  language?: string;
  accent?: string;
  previewUrl?: string;
  previewText?: string;
  usageCount: number;
  labels?: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Voice Schema
 * ==========================================
 * Defines the MongoDB schema for voices.
 */
const VoiceSchema: Schema = new Schema<IVoice>(
  {
    name: { type: String, required: true },
    voiceId: { type: String, required: true, unique: true },
    userId: { type: String },
    isDefault: { type: Boolean, default: true },
    description: { type: String },
    gender: { type: String, enum: ["male", "female", "neutral"] },
    age: { type: String, enum: ["young", "middle", "old"] },
    category: { type: String },
    language: { type: String },
    accent: { type: String },
    previewUrl: { type: String },
    previewText: { type: String },
    usageCount: { type: Number, default: 0 },
    labels: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
VoiceSchema.index({ gender: 1 });
VoiceSchema.index({ category: 1 });
VoiceSchema.index({ isFeatured: 1 });
VoiceSchema.index({ usageCount: -1 });

/**
 * ==========================================
 * Voice Model Export
 * ==========================================
 * Mongoose model to interact with the 'voices' collection.
 */
export const Voice =
  mongoose.models.Voice || mongoose.model<IVoice>("Voice", VoiceSchema);
