import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

// Explicit project root: Next.js was inferring wrong root due to multiple lockfiles
// (e.g. in /Users/apple/), causing "Can't resolve 'tailwindcss' in '/Users/apple/Documents'"
const projectRoot =
  typeof __dirname !== "undefined" ? path.resolve(__dirname) : path.resolve(process.cwd());

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    root: projectRoot,
  },

  async redirects() {
    return [
      { source: "/products/text-to-speech", destination: "/products/tts", permanent: false },
      { source: "/products/speech-to-text", destination: "/products/stt", permanent: false },
      { source: "/products/realtime-stt", destination: "/products/stt", permanent: false },
    ];
  },

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
