import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook.
 *
 * This is the centralized entrypoint Next uses to initialize monitoring for:
 * - Node.js runtime (server)
 * - Edge runtime
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Capture unhandled request errors (route handlers, server actions, etc).
 */
export const onRequestError = Sentry.captureRequestError;
