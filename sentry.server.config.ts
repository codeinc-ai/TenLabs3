import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry configuration.
 *
 * Captures errors from:
 * - Route handlers (API routes)
 * - Server components
 * - Services (e.g. ElevenLabs, Backblaze, MongoDB)
 *
 * Env vars used (and only these):
 * - SENTRY_DSN
 * - SENTRY_ENVIRONMENT
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  enabled: Boolean(process.env.SENTRY_DSN),

  // Keep this low by default; can be increased when you enable tracing intentionally.
  tracesSampleRate: 0.05,

  // Avoid shipping secrets / raw request bodies.
  beforeSend(event) {
    if (event.request) {
      const req = event.request as unknown as {
        data?: unknown;
        headers?: Record<string, string>;
      };

      // Remove request bodies (may include generated text).
      if ("data" in req) delete req.data;

      // Remove cookies / auth headers if present.
      if (req.headers) {
        const headers = { ...req.headers };
        delete headers.cookie;
        delete headers.authorization;
        delete headers["x-clerk-auth"];
        req.headers = headers;
      }
    }

    return event;
  },
});
