import * as Sentry from "@sentry/nextjs";

/**
 * Edge runtime Sentry configuration.
 *
 * Even if you don't currently run any edge routes, having this file
 * keeps the setup complete and future-proof.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.05,

  beforeSend(event) {
    if (event.request) {
      const req = event.request as unknown as {
        data?: unknown;
        headers?: Record<string, string>;
      };

      if ("data" in req) delete req.data;

      if (req.headers) {
        const headers = { ...req.headers };
        delete headers.cookie;
        delete headers.authorization;
        req.headers = headers;
      }
    }

    return event;
  },
});
