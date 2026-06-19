import { Loader2 } from "lucide-react";

/**
 * Shared loading UI for all authenticated dashboard pages.
 *
 * The (app) layout (sidebar + header) stays mounted; only this main content
 * area is replaced while a destination server component fetches its data.
 * This makes navigation between tools feel instant instead of frozen.
 */
export default function AppLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-3 px-6 py-16">
      <Loader2 className="h-7 w-7 animate-spin text-black/30 dark:text-white/40" />
      <p className="text-sm text-black/40 dark:text-white/40">Loading…</p>
    </div>
  );
}
