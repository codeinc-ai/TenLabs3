"use client";

import { useEffect, useState } from "react";
import { HeroGradientBg } from "@/components/ui/hero-gradient-bg";

/**
 * Gradient background for dashboard pages.
 * Hides immediately when realtime scribe starts, shows when it stops.
 */
export function GhostCursorBg() {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const active = (e as CustomEvent<boolean>).detail;
      setHidden(active);
    };

    window.addEventListener("realtime-scribe-active", handler);
    return () => window.removeEventListener("realtime-scribe-active", handler);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none hidden dark:block transition-opacity duration-200"
      style={{ zIndex: 0, opacity: hidden ? 0 : 1 }}
      aria-hidden="true"
    >
      <HeroGradientBg colorFrom="#000" colorTo="#4c1d95" />
    </div>
  );
}
