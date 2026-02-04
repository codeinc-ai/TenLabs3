// src/lib/posthogClient.ts
import "server-only";

import { PostHog } from "posthog-node";

import type { PostHogEventName, PostHogEventPropertiesMap } from "@/types/posthogEvents";

/**
 * PostHog server client.
 *
 * Requirements:
 * - Use env vars only:
 *   - POSTHOG_API_KEY
 *   - POSTHOG_API_HOST
 * - Never throw from analytics code (analytics must not break the main flow)
 */

type PostHogGlobal = typeof globalThis & { __tenlabsPosthog?: PostHog };

function getPosthogClient(): PostHog | null {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_API_HOST;

  if (!apiKey || !host) return null;

  const g = global as PostHogGlobal;
  if (!g.__tenlabsPosthog) {
    g.__tenlabsPosthog = new PostHog(apiKey, {
      host,
      // Defaults are fine; we keep this minimal and production-safe.
    });
  }

  return g.__tenlabsPosthog;
}

export function capturePosthogServerEvent<E extends PostHogEventName>(input: {
  distinctId: string;
  event: E;
  properties: PostHogEventPropertiesMap[E];
}): void {
  try {
    const client = getPosthogClient();
    if (!client) return;

    client.capture({
      distinctId: input.distinctId,
      event: input.event,
      properties: input.properties,
    });
  } catch {
    // Never break product logic because analytics failed.
  }
}
