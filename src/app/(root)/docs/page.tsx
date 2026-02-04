import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
};

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Docs</h1>
        <p className="mt-3 text-muted-foreground">
          Product guides and help articles.
        </p>
      </header>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">Product guides</h2>
        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/docs/product-guides/sound-effects"
              className="underline underline-offset-4"
            >
              Sound effects (product guide)
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              How to create high-quality sound effects from text with ElevenLabs.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/docs/overview/capabilities/sound-effects"
              className="underline underline-offset-4"
            >
              Sound effects (overview)
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              High-level notes on the Sound effects capability.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
