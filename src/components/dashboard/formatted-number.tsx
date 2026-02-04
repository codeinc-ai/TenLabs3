"use client";

/**
 * FormattedNumber Component
 *
 * Client component to format numbers consistently and avoid hydration mismatches.
 * Numbers are formatted only on the client side.
 */
export function FormattedNumber({ value }: { value: number }) {
  return <>{value.toLocaleString()}</>;
}
