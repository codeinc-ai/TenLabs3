/**
 * TTS Service Unit Tests
 *
 * Tests the generateSpeech function with mocked external dependencies:
 * - ElevenLabs API (fetch)
 * - Backblaze B2 upload service
 * - MongoDB models (User, Generation)
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { TTSRequest } from "@/types/TTSRequest";
import type { TTSResponse } from "@/types/TTSResponse";
import { PLANS, APP_CONFIG } from "@/constants";

// Mock external modules before importing the service
vi.mock("server-only", () => ({}));

vi.mock("@/lib/mongodb", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/services/backblazeService", () => ({
  uploadAudioMp3ToBackblaze: vi.fn().mockResolvedValue({
    fileId: "mock-file-id",
    fileName: "audio/user123/2026/01/gen123.mp3",
    url: "https://f001.backblazeb2.com/file/bucket/audio/user123/2026/01/gen123.mp3",
    sha1: "abc123",
    contentLength: 12345,
  }),
  deleteBackblazeFile: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock mongoose Types
vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");
  return {
    ...actual,
    Types: {
      ObjectId: class MockObjectId {
        private id: string;
        constructor() {
          this.id = "507f1f77bcf86cd799439011";
        }
        toHexString() {
          return this.id;
        }
      },
    },
  };
});

// Mock User model - factory must be self-contained (no external variable references)
vi.mock("@/models/User", () => ({
  User: {
    findOne: vi.fn().mockResolvedValue({
      _id: "user-db-id",
      clerkId: "user_123",
      email: "test@example.com",
      plan: "free",
      usage: {
        charactersUsed: 0,
        generationsUsed: 0,
      },
      save: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock Generation model
vi.mock("@/models/Generation", () => ({
  Generation: {
    create: vi.fn().mockResolvedValue({ _id: "gen-id" }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

// Import the service after mocks are set up
import { generateSpeech } from "@/lib/services/ttsService";
import { User } from "@/models/User";
import { Generation } from "@/models/Generation";
import { uploadAudioMp3ToBackblaze, deleteBackblazeFile } from "@/lib/services/backblazeService";

// Helper to create mock user (used in tests, not in mock factories)
const createMockUser = (overrides = {}) => ({
  _id: "user-db-id",
  clerkId: "user_123",
  email: "test@example.com",
  plan: "free" as const,
  usage: {
    charactersUsed: 0,
    generationsUsed: 0,
  },
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("ttsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock user to default state
    (User.findOne as Mock).mockResolvedValue(createMockUser());

    // Reset Generation.create to succeed (important after cleanup test)
    (Generation.create as Mock).mockResolvedValue({ _id: "gen-id" });

    // Mock successful fetch response (ElevenLabs API)
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    });
  });

  describe("generateSpeech", () => {
    it("should generate speech successfully with valid request", async () => {
      // Arrange
      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello, world!",
        voiceId: "bella",
      };

      // Act
      const response: TTSResponse = await generateSpeech(request);

      // Assert
      expect(response).toMatchObject({
        generationId: expect.any(String),
        // audioUrl is a private proxy route (Backblaze bucket is private)
        audioUrl: expect.stringContaining("/api/audio/"),
        length: 0,
        charactersUsed: 13,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.elevenlabs.io/v1/text-to-speech/bella",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "xi-api-key": "test-elevenlabs-key",
          }),
        })
      );

      expect(uploadAudioMp3ToBackblaze).toHaveBeenCalled();
      expect(Generation.create).toHaveBeenCalled();
    });

    it("should throw error when text is empty", async () => {
      // Arrange
      const request: TTSRequest = {
        userId: "user_123",
        text: "",
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow("Text is required");
    });

    it("should throw error when text exceeds maximum length", async () => {
      // Arrange
      const longText = "a".repeat(APP_CONFIG.maxTextLength + 1);
      const request: TTSRequest = {
        userId: "user_123",
        text: longText,
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow(
        `Text exceeds maximum length of ${APP_CONFIG.maxTextLength}`
      );
    });

    it("should throw error for unsupported format", async () => {
      // Arrange
      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello",
        voiceId: "bella",
        format: "wav",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow(
        "Unsupported format: wav. Only 'mp3' is supported."
      );
    });

    it("should throw error when user is not found", async () => {
      // Arrange
      (User.findOne as Mock).mockResolvedValue(null);

      const request: TTSRequest = {
        userId: "nonexistent_user",
        text: "Hello",
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow("User not found");
    });

    it("should throw error when user exceeds character limit", async () => {
      // Arrange
      const overQuotaUser = createMockUser({
        plan: "free",
        usage: {
          charactersUsed: PLANS.free.maxChars - 5, // Almost at limit
          generationsUsed: 0,
        },
      });
      (User.findOne as Mock).mockResolvedValue(overQuotaUser);

      const request: TTSRequest = {
        userId: "user_123",
        text: "This text is too long for remaining quota",
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow(
        "User has exceeded character limit for their plan"
      );
    });

    it("should throw error when user exceeds generation limit", async () => {
      // Arrange
      const overQuotaUser = createMockUser({
        plan: "free",
        usage: {
          charactersUsed: 0,
          generationsUsed: PLANS.free.maxGenerations, // At limit
        },
      });
      (User.findOne as Mock).mockResolvedValue(overQuotaUser);

      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello",
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow(
        "User has exceeded generation limit for their plan"
      );
    });

    it("should throw error when ElevenLabs API fails", async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello",
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow(
        "ElevenLabs API error (500): Internal Server Error"
      );
    });

    it("should cleanup Backblaze file when DB persistence fails", async () => {
      // Arrange
      const dbError = new Error("MongoDB connection failed");
      (Generation.create as Mock).mockRejectedValue(dbError);

      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello",
        voiceId: "bella",
      };

      // Act & Assert
      await expect(generateSpeech(request)).rejects.toThrow(
        "Failed to persist generation after uploading audio"
      );

      expect(deleteBackblazeFile).toHaveBeenCalled();
    });

    it("should use pro plan limits for pro users", async () => {
      // Arrange
      const proUser = createMockUser({
        plan: "pro",
        usage: {
          charactersUsed: PLANS.free.maxChars + 100, // Over free limit but under pro
          generationsUsed: PLANS.free.maxGenerations + 5,
        },
      });
      (User.findOne as Mock).mockResolvedValue(proUser);

      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello",
        voiceId: "bella",
      };

      // Act
      const response = await generateSpeech(request);

      // Assert - should succeed for pro user
      expect(response.audioUrl).toBeDefined();
    });

    it("should use default voice when voiceId is not provided", async () => {
      // Arrange
      const request: TTSRequest = {
        userId: "user_123",
        text: "Hello",
        voiceId: "", // Empty voice ID
      };

      // Act
      await generateSpeech(request);

      // Assert - should use first DEFAULT_VOICES entry (ElevenLabs voice_id)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/text-to-speech/"),
        expect.any(Object)
      );
    });
  });
});
