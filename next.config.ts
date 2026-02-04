import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */

  // Sentry DSN is safe to expose to the client (it's not a secret).
  // We keep env var names consistent across server/client per project requirements.
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,

    // PostHog: API key is safe to expose to the client.
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    POSTHOG_API_HOST: process.env.POSTHOG_API_HOST,
  },
};

// Wrap the Next config so Sentry can upload sourcemaps (when configured)
// and apply framework-specific instrumentation.
export default withSentryConfig(nextConfig, {
  // Silence logs in CI/build by default.
  silent: true,
});
