// src/lib/posthogBrowser.ts
"use client";

import posthog from "posthog-js";

import type { PostHogEventName, PostHogEventPropertiesMap } from "@/types/posthogEvents";

let initialized = false;

/**
 * Initializes PostHog in the browser.
 *
 * Requirements:
 * - Use env vars only:
 *   - POSTHOG_API_KEY
 *   - POSTHOG_API_HOST
 */
export function initPosthogBrowser(): void {
  if (initialized) return;

  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_API_HOST;

  if (!apiKey || !host) return;

  posthog.init(apiKey, {
    api_host: host,

    // We do manual page_view events in the App Router provider.
    capture_pageview: false,

    // Keep it explicit; add autocapture later if desired.
    autocapture: false,
  });

  initialized = true;
}

export function capturePosthogBrowserEvent<E extends PostHogEventName>(
  event: E,
  properties: PostHogEventPropertiesMap[E]
): void {
  try {
    // Ensure we don't throw even if init isn't configured.
    if (!initialized) initPosthogBrowser();
    if (!initialized) return;

    posthog.capture(event, properties);
  } catch {
    // Never break UX because analytics failed.
  }
}

export { posthog };
