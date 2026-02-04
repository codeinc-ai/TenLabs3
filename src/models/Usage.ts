// src/models/Usage.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Usage Document Interface
 * ==========================================
 * Defines the TypeScript type for per-user usage tracking.
 */
export interface IUsage extends Document {
  userId: Types.ObjectId;        // Reference to the user
  charactersUsed: number;        // Total characters generated
  generationsUsed: number;       // Total TTS generations
  periodStart: Date;             // Start of usage period (e.g., monthly)
  periodEnd: Date;               // End of usage period
  createdAt: Date;               // When usage record was created
  updatedAt: Date;               // Last updated timestamp
}

/**
 * ==========================================
 * Usage Schema
 * ==========================================
 * Defines the MongoDB schema for tracking per-user usage.
 */
const UsageSchema: Schema = new Schema<IUsage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    charactersUsed: { type: Number, default: 0 },
    generationsUsed: { type: Number, default: 0 },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/**
 * ==========================================
 * Usage Model Export
 * ==========================================
 * Mongoose model to interact with the 'usage' collection.
 */
export const Usage =
  mongoose.models.Usage || mongoose.model<IUsage>("Usage", UsageSchema);
