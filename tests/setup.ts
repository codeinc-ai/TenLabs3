/**
 * Vitest global setup file
 *
 * This file runs before each test file and sets up:
 * - jest-dom matchers for React Testing Library
 * - Global mocks for external services
 * - Environment variable defaults for testing
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// Mock environment variables for testing
process.env.ELEVENLABS_API_KEY = "test-elevenlabs-key";

// Polyfills for Radix UI / shadcn components in jsdom
// (prevents "ResizeObserver is not defined" and pointer capture errors)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = global.ResizeObserver || MockResizeObserver;

if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false);
  Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => undefined);
  Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => undefined);
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => undefined);
}

// Map UI-friendly voice aliases (e.g. "bella") to the ElevenLabs voice_id.
// In tests we keep them identical so unit tests can assert on the request URL.
process.env.ELEVENLABS_VOICE_BELLA = "bella";
process.env.ELEVENLABS_VOICE_ALLOY = "alloy";

process.env.B2_KEY_ID = "test-b2-key-id";
process.env.B2_APP_KEY = "test-b2-app-key";
process.env.B2_BUCKET_ID = "test-bucket-id";
process.env.B2_BUCKET_NAME = "test-bucket";
process.env.MONGODB_URI = "mongodb://localhost:27017/tenlabs-test";

// Reset all mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Mock global fetch for API tests
global.fetch = vi.fn();

// Mock Sentry to prevent actual error reporting during tests
vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((callback) => callback({ setTag: vi.fn(), setUser: vi.fn(), setContext: vi.fn() })),
  captureException: vi.fn(),
}));

// Mock PostHog analytics
vi.mock("@/lib/posthogClient", () => ({
  capturePosthogServerEvent: vi.fn(),
}));

vi.mock("@/lib/posthogBrowser", () => ({
  capturePosthogBrowserEvent: vi.fn(),
}));
