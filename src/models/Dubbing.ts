// src/models/Dubbing.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Dubbing Document Interface
 * ==========================================
 * Defines the TypeScript type for a dubbing project document.
 */
export interface IDubbing extends Document {
  userId: Types.ObjectId;           // Reference to the user who created this dubbing
  dubbingId: string;                // ElevenLabs dubbing ID
  projectName: string;              // Project name
  originalFileName: string;         // User's uploaded file name
  originalAudioPath: string;        // Backblaze path to original audio/video
  originalAudioFileId?: string;     // Backblaze fileId for original (for deletion)
  sourceLanguage: string;           // Source language code
  targetLanguages: string[];        // Target language codes
  status: "pending" | "dubbing" | "dubbed" | "failed"; // Dubbing status
  dubbedAudioPaths?: Record<string, string>;  // Map of language code to Backblaze path
  dubbedAudioFileIds?: Record<string, string>; // Map of language code to fileId
  duration: number;                 // Audio duration in seconds
  numSpeakers?: number;             // Number of speakers
  startTime?: number;               // Start time for partial dubbing
  endTime?: number;                 // End time for partial dubbing
  watermark?: boolean;              // Watermark added
  highestResolution?: boolean;      // Highest resolution used
  errorMessage?: string;            // Error message if failed
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Dubbing Schema
 * ==========================================
 * Defines the MongoDB schema for storing dubbing projects.
 */
const DubbingSchema: Schema = new Schema<IDubbing>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dubbingId: { type: String, required: true },
    projectName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    originalAudioPath: { type: String, required: true },
    originalAudioFileId: { type: String },
    sourceLanguage: { type: String, required: true },
    targetLanguages: { type: [String], required: true },
    status: { 
      type: String, 
      enum: ["pending", "dubbing", "dubbed", "failed"], 
      default: "pending" 
    },
    dubbedAudioPaths: { type: Map, of: String },
    dubbedAudioFileIds: { type: Map, of: String },
    duration: { type: Number, default: 0 },
    numSpeakers: { type: Number },
    startTime: { type: Number },
    endTime: { type: Number },
    watermark: { type: Boolean },
    highestResolution: { type: Boolean },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based queries
DubbingSchema.index({ userId: 1, createdAt: -1 });
DubbingSchema.index({ dubbingId: 1 });

/**
 * ==========================================
 * Dubbing Model Export
 * ==========================================
 * Mongoose model to interact with the 'dubbings' collection.
 */
export const Dubbing =
  mongoose.models.Dubbing ||
  mongoose.model<IDubbing>("Dubbing", DubbingSchema);
