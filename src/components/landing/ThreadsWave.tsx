"use client";

import Threads from "@/components/Threads";

/**
 * Threads wave section - shown above the footer on the homepage.
 * Uses a light gray/lavender color for the wave effect.
 */
export function ThreadsWave() {
  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
      <Threads
        color={[0.784, 0.776, 0.824]}
        amplitude={1.1}
        distance={0.4}
        enableMouseInteraction
      />
    </div>
  );
}
