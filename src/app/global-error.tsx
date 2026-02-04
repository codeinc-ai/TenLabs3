"use client";

import * as Sentry from "@sentry/nextjs";

/**
 * Global error boundary for the App Router.
 *
 * Next.js will render this when an unhandled error happens in a server component
 * or during rendering/navigation.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Report once when the boundary is rendered.
  Sentry.withScope((scope) => {
    scope.setTag("feature", "app");
    scope.setTag("service", "react");

    if (error.digest) {
      scope.setContext("next", { digest: error.digest });
    }

    Sentry.captureException(error);
  });

  return (
    <html>
      <body>
        <h2>Something went wrong.</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
