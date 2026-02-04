// src/models/VoiceConversion.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Voice Conversion Document Interface
 * ==========================================
 * Defines the TypeScript type for a voice conversion document.
 */
export interface IVoiceConversion extends Document {
  userId: Types.ObjectId;           // Reference to the user who created this conversion
  originalFileName: string;         // User's uploaded file name
  originalAudioPath: string;        // Backblaze path to original audio
  originalAudioFileId?: string;     // Backblaze fileId for original (for deletion)
  targetVoiceId: string;            // ElevenLabs voice ID used for conversion
  targetVoiceName?: string;         // Human-readable voice name
  convertedAudioPath: string;       // Backblaze path to converted audio
  convertedAudioFileId?: string;    // Backblaze fileId for converted (for deletion)
  duration: number;                 // Audio duration in seconds
  modelId: string;                  // Model used for conversion
  settings: {
    stability: number;
    similarityBoost: number;
    styleExaggeration?: number;
    removeBackgroundNoise?: boolean;
    speakerBoost?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Voice Conversion Schema
 * ==========================================
 * Defines the MongoDB schema for storing voice conversions.
 */
const VoiceConversionSchema: Schema = new Schema<IVoiceConversion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalFileName: { type: String, required: true },
    originalAudioPath: { type: String, required: true },
    originalAudioFileId: { type: String },
    targetVoiceId: { type: String, required: true },
    targetVoiceName: { type: String },
    convertedAudioPath: { type: String, required: true },
    convertedAudioFileId: { type: String },
    duration: { type: Number, default: 0 },
    modelId: { type: String, required: true },
    settings: {
      stability: { type: Number, default: 0.5 },
      similarityBoost: { type: Number, default: 0.75 },
      styleExaggeration: { type: Number },
      removeBackgroundNoise: { type: Boolean },
      speakerBoost: { type: Boolean },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based queries
VoiceConversionSchema.index({ userId: 1, createdAt: -1 });

/**
 * ==========================================
 * Voice Conversion Model Export
 * ==========================================
 * Mongoose model to interact with the 'voiceconversions' collection.
 */
export const VoiceConversion =
  mongoose.models.VoiceConversion ||
  mongoose.model<IVoiceConversion>("VoiceConversion", VoiceConversionSchema);
