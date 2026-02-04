import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry configuration.
 *
 * Note: We intentionally read ONLY these environment variables:
 * - SENTRY_DSN
 * - SENTRY_ENVIRONMENT
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,

  // DSN missing => disable (useful for local dev without Sentry)
  enabled: Boolean(process.env.SENTRY_DSN),

  // Keep this low by default; safe baseline for future performance monitoring.
  tracesSampleRate: 0.05,

  // Never attach potentially sensitive payloads.
  beforeSend(event) {
    if (event.request) {
      // In browsers, request data can include POST bodies.
      // We don't want to accidentally ship raw user text.
      const req = event.request as unknown as { data?: unknown };
      if ("data" in req) delete req.data;
    }

    return event;
  },
});
