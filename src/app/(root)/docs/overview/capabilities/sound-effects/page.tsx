import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sound effects (overview)",
  description: "Overview of the Sound effects capability.",
};

export default function SoundEffectsOverviewPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="max-w-3xl">
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Sound effects
        </h1>
        <p className="mt-3 text-muted-foreground">
          This page is a placeholder overview for the Sound effects capability.
        </p>
      </header>

      <section className="mt-10 max-w-3xl">
        <p className="text-muted-foreground">
          Want the step-by-step guide instead?{" "}
          <Link
            href="/docs/product-guides/sound-effects"
            className="text-foreground underline underline-offset-4"
          >
            View the Sound effects product guide
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
