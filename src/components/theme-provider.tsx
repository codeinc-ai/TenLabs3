"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes provider for dark/light mode support.
 * Features:
 * - System preference detection
 * - localStorage persistence
 * - SSR-safe hydration
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
