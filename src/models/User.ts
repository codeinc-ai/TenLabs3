// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * ==========================================
 * User Document Interface
 * ==========================================
 * Defines the TypeScript type for a User document in MongoDB.
 */
export interface IUser extends Document {
  /** Clerk user id (stable identifier across sessions). */
  clerkId: string;
  email: string;                 // User's email (from Clerk)
  name?: string;                 // Optional display name
  plan: "free" | "pro";          // Subscription plan
  usage: {
    charactersUsed: number;      // Number of characters generated
    generationsUsed: number;     // Number of TTS generations
    transcriptionMinutesUsed: number;  // Minutes of audio transcribed
    transcriptionsUsed: number;        // Number of STT transcriptions
    soundEffectsUsed: number;          // Number of SFX generations
  };
  createdAt: Date;               // Account creation date
  updatedAt: Date;               // Last update date
}

/**
 * ==========================================
 * User Schema
 * ==========================================
 * Defines the MongoDB schema for storing users.
 */
const UserSchema: Schema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    usage: {
      charactersUsed: { type: Number, default: 0 },
      generationsUsed: { type: Number, default: 0 },
      transcriptionMinutesUsed: { type: Number, default: 0 },
      transcriptionsUsed: { type: Number, default: 0 },
      soundEffectsUsed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * ==========================================
 * User Model Export
 * ==========================================
 * This is the Mongoose model used to interact with the 'users' collection.
 */
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
