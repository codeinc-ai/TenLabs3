"use client";

import { useEffect, useState } from "react";

import Aurora from "@/components/Aurora";

/**
 * Aurora background for dashboard pages.
 * Hides immediately when realtime scribe starts, shows when it stops.
 */
export function GhostCursorBg() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const active = (e as CustomEvent<boolean>).detail;
      setHidden(active);
    };

    window.addEventListener("realtime-scribe-active", handler);
    return () => window.removeEventListener("realtime-scribe-active", handler);
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none hidden dark:block transition-opacity duration-200"
      style={{ zIndex: 0, opacity: hidden ? 0 : 1 }}
      aria-hidden="true"
    >
      <Aurora
        colorStops={["#1e1b4b", "#312e81", "#4c1d95"]}
        amplitude={3}
        blend={0.7}
      />
    </div>
  );
}
