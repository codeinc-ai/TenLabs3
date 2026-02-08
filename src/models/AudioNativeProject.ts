import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAudioNativeProject extends Document {
  userId: Types.ObjectId;
  name: string;
  elevenLabsProjectId: string;
  title?: string;
  author?: string;
  voiceId?: string;
  modelId?: string;
  textColor?: string;
  backgroundColor?: string;
  htmlSnippet: string;
  status: "processing" | "ready";
  autoConvert: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AudioNativeProjectSchema: Schema = new Schema<IAudioNativeProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    elevenLabsProjectId: { type: String, required: true },
    title: { type: String },
    author: { type: String },
    voiceId: { type: String },
    modelId: { type: String },
    textColor: { type: String },
    backgroundColor: { type: String },
    htmlSnippet: { type: String, required: true },
    status: { type: String, enum: ["processing", "ready"], default: "processing" },
    autoConvert: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const AudioNativeProject =
  mongoose.models.AudioNativeProject ||
  mongoose.model<IAudioNativeProject>("AudioNativeProject", AudioNativeProjectSchema);
