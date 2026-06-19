import Link from "next/link";

export interface LegalSection {
  heading: string;
  /** Each entry is a paragraph. Use a string[] for bullet lists. */
  body: Array<string | string[]>;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Shared layout for legal documents (Terms, Privacy, Policy).
 *
 * Lives inside the (root) route group, so the marketing nav + footer wrap it
 * automatically. Fully theme-aware and responsive.
 */
export function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white text-black transition-colors dark:bg-black dark:text-white">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:pt-32">
        {/* Header */}
        <header className="border-b border-black/10 pb-8 dark:border-white/10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
            Legal
          </p>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            {title}
          </h1>
          <p className="mt-3 text-sm text-black/50 dark:text-white/50">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-5 text-[15px] leading-7 text-black/70 dark:text-white/70">
            {intro}
          </p>
        </header>

        {/* Table of contents */}
        <nav className="mt-8 grid gap-1 rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-2">
          {sections.map((section, i) => (
            <a
              key={section.heading}
              href={`#section-${i + 1}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/65 transition hover:bg-black/5 hover:text-black dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <span className="tabular-nums text-black/35 dark:text-white/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </a>
          ))}
        </nav>

        {/* Sections */}
        <div className="mt-12 space-y-12">
          {sections.map((section, i) => (
            <section
              key={section.heading}
              id={`section-${i + 1}`}
              className="scroll-mt-28"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                <span className="mr-2 text-black/30 dark:text-white/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((block, j) =>
                  Array.isArray(block) ? (
                    <ul key={j} className="space-y-2">
                      {block.map((item, k) => (
                        <li
                          key={k}
                          className="flex gap-3 text-[15px] leading-7 text-black/70 dark:text-white/70"
                        >
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/30 dark:bg-white/30" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      key={j}
                      className="text-[15px] leading-7 text-black/70 dark:text-white/70"
                    >
                      {block}
                    </p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm text-black/60 dark:text-white/60">
            Questions about this document? Reach us at{" "}
            <a
              href="mailto:legal@tenlabs.ai"
              className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
            >
              legal@tenlabs.ai
            </a>{" "}
            or visit our{" "}
            <Link
              href="/support"
              className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
            >
              support page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
