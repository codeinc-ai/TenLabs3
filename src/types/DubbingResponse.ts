// src/types/DubbingResponse.ts

/**
 * Represents the output from the dubbing service
 * Returned after successful dubbing creation
 */
export interface DubbingResponse {
  dubbingId: string;               // ElevenLabs dubbing ID
  projectId: string;               // MongoDB document ID
  projectName: string;             // Project name
  status: "pending" | "dubbing" | "dubbed" | "failed"; // Dubbing status
  sourceLanguage: string;          // Detected/provided source language
  targetLanguages: string[];       // Target languages
  audioUrls?: Record<string, string>; // Map of language code to audio URL
  originalFileName: string;        // Original uploaded file name
}
