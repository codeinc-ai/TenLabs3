// src/models/Generation.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Generation Document Interface
 * ==========================================
 * Defines the TypeScript type for a TTS generation document.
 */
export interface IGeneration extends Document {
  userId: Types.ObjectId;        // Reference to the user who created this generation
  text: string;                  // Original text input
  voiceId: string;               // Voice used (matches ElevenLabs voice ID)

  /**
   * Backblaze B2 file name ("key") used to retrieve/delete the file.
   * Example: audio/{clerkUserId}/2026/01/{generationId}.mp3
   */
  audioPath: string;

  /**
   * Public/signed download URL for the audio.
   * Note: For private buckets, you'll typically re-generate a signed URL on demand.
   */
  audioUrl: string;

  /**
   * Optional Backblaze fileId. Storing it avoids listing file versions for deletes.
   */
  audioFileId?: string;

  length: number;                // Audio length in seconds
  provider?: string;             // TTS provider ("elevenlabs" | "minimax")
  isFavorite: boolean;           // Whether the user has favorited this generation
  createdAt: Date;               // When the generation was created
  updatedAt: Date;               // Last updated timestamp
}

/**
 * ==========================================
 * Generation Schema
 * ==========================================
 * Defines the MongoDB schema for storing TTS generations.
 */
const GenerationSchema: Schema = new Schema<IGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    voiceId: { type: String, required: true },

    // Backblaze metadata
    audioPath: { type: String, required: true },
    audioUrl: { type: String, required: true },
    audioFileId: { type: String },

    length: { type: Number, default: 0 }, // optional: fill after audio is generated
    provider: { type: String, default: "elevenlabs" },
    isFavorite: { type: Boolean, default: false }, // user favorite flag
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/**
 * ==========================================
 * Generation Model Export
 * ==========================================
 * Mongoose model to interact with the 'generations' collection.
 */
export const Generation =
  mongoose.models.Generation ||
  mongoose.model<IGeneration>("Generation", GenerationSchema);
