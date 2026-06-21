"use client";

import { useEffect, useState } from "react";

/**
 * Ambient gradient background for dashboard pages.
 *
 * A soft purple glow anchored at the top that fades smoothly into the page
 * background — premium and subtle rather than a hard color band.
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
      className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-hidden transition-opacity duration-300 dark:block"
      style={{ zIndex: 0, opacity: hidden ? 0 : 1 }}
      aria-hidden="true"
    >
      {/* Primary glow – fades smoothly from a soft violet at the top to nothing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -20%, rgba(124,58,237,0.30) 0%, rgba(76,29,149,0.14) 28%, rgba(15,12,28,0.04) 55%, rgba(0,0,0,0) 75%)",
        }}
      />
      {/* Secondary accent – a faint cool highlight for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 85% 0%, rgba(56,89,220,0.16) 0%, rgba(0,0,0,0) 55%)",
        }}
      />
    </div>
  );
}
