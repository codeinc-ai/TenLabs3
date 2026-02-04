"use client";

import * as Sentry from "@sentry/nextjs";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: unknown;
  resetError: () => void;
}

/**
 * Error Fallback UI Component
 *
 * Rendered when an error is caught by the Sentry error boundary.
 * Provides a user-friendly error message and retry button.
 */
function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  // Extract error message from unknown error type
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected error occurred";

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-foreground">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error. Our team has been notified and is
        working to fix it.
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-md bg-muted p-4 text-left text-xs">
          {errorMessage}
        </pre>
      )}

      <Button onClick={resetError} className="mt-6 gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Dashboard Error Boundary Component
 *
 * Wraps dashboard content with Sentry's error boundary.
 * Automatically captures errors with user context and page information.
 *
 * Features:
 * - Captures errors to Sentry with userId and page context
 * - Shows user-friendly fallback UI
 * - Allows retry via reset button
 */
export function DashboardErrorBoundary({
  children,
}: DashboardErrorBoundaryProps) {
  const pathname = usePathname();
  const { user } = useUser();

  /**
   * Called before Sentry captures an error.
   * Adds user context and page information to the error report.
   */
  const handleBeforeCapture = (scope: Sentry.Scope) => {
    scope.setTag("feature", "dashboard");
    scope.setTag("service", "react");
    scope.setTag("page", pathname);

    if (user?.id) {
      scope.setUser({ id: user.id });
      scope.setTag("userId", user.id);
    }

    scope.setContext("navigation", {
      pathname,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Sentry.ErrorBoundary
      beforeCapture={handleBeforeCapture}
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
