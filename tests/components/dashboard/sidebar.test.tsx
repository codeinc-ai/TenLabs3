/**
 * Sidebar Component Tests
 *
 * Tests the dashboard sidebar navigation component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

// Import component after mocks
import { Sidebar } from "@/components/dashboard/sidebar";
import { usePathname } from "next/navigation";

describe("Sidebar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
  });

  describe("Rendering", () => {
    it("should render all navigation items", () => {
      render(<Sidebar />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Text to Speech")).toBeInTheDocument();
      expect(screen.getByText("Speech to Text")).toBeInTheDocument();
      expect(screen.getByText("Voices")).toBeInTheDocument();
      expect(screen.getByText("Voice Changer")).toBeInTheDocument();
      expect(screen.getByText("Sound Effects")).toBeInTheDocument();
      expect(screen.getByText("Voice Isolator")).toBeInTheDocument();
      expect(screen.getByText("Studio")).toBeInTheDocument();
      expect(screen.getByText("Dubbing")).toBeInTheDocument();
      expect(screen.getByText("Audio Native")).toBeInTheDocument();
      expect(screen.getByText("Productions")).toBeInTheDocument();
    });

    it("should render brand logo", () => {
      render(<Sidebar />);

      expect(screen.getByText("Ten Labs")).toBeInTheDocument();
    });

    it("should render section headers", () => {
      render(<Sidebar />);

      expect(screen.getByText("Playground")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("should render upgrade button", () => {
      render(<Sidebar />);

      expect(screen.getByText("Upgrade")).toBeInTheDocument();
    });
  });

  describe("Active Link Highlighting", () => {
    it("should highlight the active link for /dashboard", () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");

      render(<Sidebar />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass("bg-gray-100");
    });

    it("should highlight the active link for /tts", () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/tts");

      render(<Sidebar />);

      const ttsLink = screen.getByText("Text to Speech").closest("a");
      expect(ttsLink).toHaveClass("bg-gray-100");
    });

    it("should highlight nested routes correctly", () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/tts/history");

      render(<Sidebar />);

      const ttsLink = screen.getByText("Text to Speech").closest("a");
      expect(ttsLink).toHaveClass("bg-gray-100");
    });

    it("should not highlight /dashboard for nested routes of other sections", () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/voices/custom");

      render(<Sidebar />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).not.toHaveClass("bg-gray-100");

      const voicesLink = screen.getByText("Voices").closest("a");
      expect(voicesLink).toHaveClass("bg-gray-100");
    });
  });

  describe("Navigation Links", () => {
    it("should have correct href for each nav item", () => {
      render(<Sidebar />);

      expect(screen.getByText("Home").closest("a")).toHaveAttribute(
        "href",
        "/dashboard"
      );
      expect(screen.getByText("Text to Speech").closest("a")).toHaveAttribute(
        "href",
        "/tts"
      );
      expect(screen.getByText("Speech to Text").closest("a")).toHaveAttribute(
        "href",
        "/stt"
      );
      expect(screen.getByText("Voices").closest("a")).toHaveAttribute(
        "href",
        "/voices"
      );
      expect(screen.getByText("Voice Changer").closest("a")).toHaveAttribute(
        "href",
        "/voice-changer"
      );
      expect(screen.getByText("Sound Effects").closest("a")).toHaveAttribute(
        "href",
        "/sound-effects"
      );
    });
  });
});
