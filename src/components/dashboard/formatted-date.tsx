"use client";

/**
 * FormattedDate Component
 *
 * Client component to format dates consistently and avoid hydration mismatches.
 * Dates are formatted only on the client side.
 */
export function FormattedDate({ date }: { date: string }) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return <>{formatted}</>;
}
