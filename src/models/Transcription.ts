// src/models/Transcription.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * ==========================================
 * Speaker Interface
 * ==========================================
 * Represents a speaker identified during diarization.
 */
export interface ISpeaker {
  id: string;
  name: string;
}

/**
 * ==========================================
 * Word Interface
 * ==========================================
 * Represents a word with timestamps from the transcription.
 */
export interface IWord {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

/**
 * ==========================================
 * Transcription Document Interface
 * ==========================================
 * Defines the TypeScript type for a STT transcription document.
 */
export interface ITranscription extends Document {
  userId: Types.ObjectId;           // Reference to the user who created this transcription
  originalFileName: string;         // User's uploaded file name
  audioPath: string;                // Backblaze path: transcripts/{userId}/{year}/{month}/{id}.{ext}
  audioFileId?: string;             // Backblaze fileId for deletion
  text: string;                     // Transcribed text output
  language: string;                 // Detected/specified language code
  languageProbability: number;      // Confidence of language detection
  duration: number;                 // Audio duration in seconds
  speakers?: ISpeaker[];            // Speaker diarization (optional)
  words?: IWord[];                  // Word-level timestamps (optional)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ==========================================
 * Speaker Schema
 * ==========================================
 */
const SpeakerSchema = new Schema<ISpeaker>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

/**
 * ==========================================
 * Word Schema
 * ==========================================
 */
const WordSchema = new Schema<IWord>(
  {
    text: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    speaker: { type: String },
  },
  { _id: false }
);

/**
 * ==========================================
 * Transcription Schema
 * ==========================================
 * Defines the MongoDB schema for storing STT transcriptions.
 */
const TranscriptionSchema: Schema = new Schema<ITranscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalFileName: { type: String, required: true },
    audioPath: { type: String, required: true },
    audioFileId: { type: String },
    text: { type: String, required: true },
    language: { type: String, required: true },
    languageProbability: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    speakers: { type: [SpeakerSchema], default: undefined },
    words: { type: [WordSchema], default: undefined },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based queries
TranscriptionSchema.index({ userId: 1, createdAt: -1 });

/**
 * ==========================================
 * Transcription Model Export
 * ==========================================
 * Mongoose model to interact with the 'transcriptions' collection.
 */
export const Transcription =
  mongoose.models.Transcription ||
  mongoose.model<ITranscription>("Transcription", TranscriptionSchema);
