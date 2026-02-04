/**
 * TTS Client Component Tests
 *
 * Tests the TTSClient React component using React Testing Library:
 * - Form input validation
 * - Button states and interactions
 * - API call triggering
 * - Audio playback component rendering
 * - Error display
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock Clerk authentication
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({
    user: { id: "user_test123" },
    isLoaded: true,
    isSignedIn: true,
  })),
}));

// Mock Next navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));

// Mock constants
vi.mock("@/constants", () => ({
  DEFAULT_VOICES: [
    { id: "bella", name: "Bella", category: "Conversational" },
    { id: "alloy", name: "Alloy", category: "Narration" },
  ],
  TTS_DEFAULTS: {
    stability: 0.5,
    similarityBoost: 0.75,
    format: "mp3",
  },
  PLANS: {
    free: { maxChars: 10000, maxGenerations: 10 },
    pro: { maxChars: 50000, maxGenerations: 100 },
  },
}));

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((callback) =>
    callback({ setTag: vi.fn(), setUser: vi.fn(), setContext: vi.fn() })
  ),
  captureException: vi.fn(),
}));

// Mock PostHog
vi.mock("@/lib/posthogBrowser", () => ({
  capturePosthogBrowserEvent: vi.fn(),
}));

// Import component after mocks
import { TTSClient } from "@/app/(app)/tts/TTSClient";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";

describe("TTSClient Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful API response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            audioUrl: "https://example.com/audio.mp3",
            generationId: "gen_123",
          },
        }),
    });
  });

  describe("Initial Render", () => {
    it("should render the text input area", () => {
      // Arrange & Act
      render(<TTSClient />);

      // Assert
      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      expect(textarea).toBeInTheDocument();
    });

    it("should render the voice selection dropdown", () => {
      // Arrange & Act
      render(<TTSClient />);

      // Assert
      const voiceSelect = screen.getByRole("combobox");
      expect(voiceSelect).toBeInTheDocument();
    });

    it("should render the generate button", () => {
      // Arrange & Act
      render(<TTSClient />);

      // Assert
      const button = screen.getByRole("button", { name: /generate speech/i });
      expect(button).toBeInTheDocument();
    });

    it("should have generate button disabled initially (empty text)", () => {
      // Arrange & Act
      render(<TTSClient />);

      // Assert
      const button = screen.getByRole("button", { name: /generate speech/i });
      expect(button).toBeDisabled();
    });

    it("should display default voice options", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      // Act
      // Radix Select options render in a portal when opened.
      const voiceTrigger = screen.getByRole("combobox");
      await user.click(voiceTrigger);

      // Assert
      // Radix Select renders the selected value AND the menu item text, so "findByText" can be ambiguous.
      expect((await screen.findAllByText("Bella")).length).toBeGreaterThan(0);
      expect((await screen.findAllByText("Alloy")).length).toBeGreaterThan(0);
    });
  });

  describe("Form Input Validation", () => {
    it("should enable generate button when text is entered", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      // Act
      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello, world!");

      // Assert
      const button = screen.getByRole("button", { name: /generate speech/i });
      expect(button).not.toBeDisabled();
    });

    it("should keep button disabled for whitespace-only text", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      // Act
      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "   ");

      // Assert
      const button = screen.getByRole("button", { name: /generate speech/i });
      expect(button).toBeDisabled();
    });

    it("should allow changing voice selection", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      // Act
      const voiceTrigger = screen.getByRole("combobox");
      await user.click(voiceTrigger);
      await user.click(await screen.findByText("Alloy"));

      // Assert
      expect(voiceTrigger).toHaveTextContent("Alloy");
    });

    it("should track voice selection changes in PostHog", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      // Act
      const voiceTrigger = screen.getByRole("combobox");
      await user.click(voiceTrigger);
      await user.click(await screen.findByText("Alloy"));

      // Assert
      expect(capturePosthogBrowserEvent).toHaveBeenCalledWith(
        "voice_selected",
        expect.objectContaining({
          voiceId: "alloy",
        })
      );
    });
  });

  describe("API Call Triggering", () => {
    it("should call API when generate button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello, world!");

      // Act
      const button = screen.getByRole("button", { name: /generate speech/i });
      await user.click(button);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tts",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("Hello, world!"),
        })
      );
    });

    it("should show loading state while generating", async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      success: true,
                      data: { audioUrl: "https://example.com/audio.mp3", generationId: "gen_123" },
                    }),
                }),
              100
            )
          )
      );

      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate speech/i });
      await user.click(button);

      // Assert
      expect(screen.getByRole("button", { name: /generating/i })).toBeInTheDocument();
    });

    it("should disable button during loading", async () => {
      // Arrange
      let resolvePromise: (value: unknown) => void;
      (global.fetch as Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate speech/i });
      await user.click(button);

      // Assert
      expect(button).toBeDisabled();

      // Cleanup - resolve the promise
      resolvePromise!({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { audioUrl: "test", generationId: "test" },
          }),
      });
    });

    it("should send correct voice ID in API request", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      const voiceTrigger = screen.getByRole("combobox");
      await user.click(voiceTrigger);
      await user.click(await screen.findByText("Alloy"));

      // Act
      const button = screen.getByRole("button", { name: /generate speech/i });
      await user.click(button);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tts",
        expect.objectContaining({
          body: expect.stringContaining('"voiceId":"alloy"'),
        })
      );
    });
  });

  describe("Audio Playback Component", () => {
    it("should display audio player after successful generation", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate speech/i });
      await user.click(button);

      // Assert
      await waitFor(() => {
        const audio = document.querySelector("audio");
        expect(audio).toBeInTheDocument();
        expect(audio).toHaveAttribute("src", "https://example.com/audio.mp3");
      });
    });

    it("should not display audio player before generation", () => {
      // Arrange & Act
      render(<TTSClient />);

      // Assert
      const audio = document.querySelector("audio");
      expect(audio).not.toBeInTheDocument();
    });

    it("should track audio play event in PostHog", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      const button = screen.getByRole("button", { name: /generate/i });
      await user.click(button);

      // Wait for audio player
      await waitFor(() => {
        expect(document.querySelector("audio")).toBeInTheDocument();
      });

      // Act
      const audio = document.querySelector("audio")!;
      fireEvent.play(audio);

      // Assert
      expect(capturePosthogBrowserEvent).toHaveBeenCalledWith(
        "audio_played",
        expect.objectContaining({
          generationId: "gen_123",
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should display error message when API fails", async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        // Response.json() exists on real fetch Responses; in this case we simulate non-JSON failure.
        json: () => Promise.reject(new Error("not-json")),
      });

      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate/i });
      await user.click(button);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Request failed \(500\)/)).toBeInTheDocument();
      });
    });

    it("should display error when response payload is invalid", async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      });

      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate/i });
      await user.click(button);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Invalid response from server/)).toBeInTheDocument();
      });
    });

    it("should clear previous audio when new generation fails", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // First successful generation
      const button = screen.getByRole("button", { name: /generate/i });
      await user.click(button);

      await waitFor(() => {
        expect(document.querySelector("audio")).toBeInTheDocument();
      });

      // Set up failure for next request
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Error"),
      });

      // Act - second generation that fails
      await user.click(button);

      // Assert
      await waitFor(() => {
        expect(document.querySelector("audio")).not.toBeInTheDocument();
      });
    });

    it("should re-enable button after error", async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Error"),
      });

      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate/i });
      await user.click(button);

      // Assert
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("PostHog Analytics", () => {
    it("should track successful generation", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TTSClient />);

      const textarea = screen.getByPlaceholderText(
        "Enter the text you want to convert to speech..."
      );
      await user.type(textarea, "Hello");

      // Act
      const button = screen.getByRole("button", { name: /generate/i });
      await user.click(button);

      // Assert
      await waitFor(() => {
        expect(capturePosthogBrowserEvent).toHaveBeenCalledWith(
          "tts_generated",
          expect.objectContaining({
            generationId: "gen_123",
            textLength: 5,
          })
        );
      });
    });
  });
});
