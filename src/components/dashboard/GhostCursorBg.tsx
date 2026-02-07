"use client";

import Aurora from "@/components/Aurora";

/**
 * Aurora background for dashboard homepage.
 * Uses Aurora (same as homepage hero) - reliable WebGL effect.
 */
export function GhostCursorBg() {
  return (
    <div
      className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none hidden dark:block"
      style={{ zIndex: 0 }}
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
