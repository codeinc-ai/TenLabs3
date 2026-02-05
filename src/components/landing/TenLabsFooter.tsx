"use client";

import Link from "next/link";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function TenLabsFooter() {
  const cols = [
    {
      title: "Research",
      items: [
        { href: "/products/tts", label: "Text to Speech (TTS)" },
        { href: "/products/stt", label: "Speech to Text" },
        { href: "/products/realtime-stt", label: "Realtime Speech to Text" },
        { href: "/products/voice-changer", label: "Voice Changer" },
        { href: "/products/sfx", label: "Text to Sound Effects" },
        { href: "/products/voice-cloning", label: "Voice Cloning" },
        { href: "/products/voice-isolator", label: "Voice Isolator" },
      ],
    },
    {
      title: "Products",
      items: [
        { href: "/products/studio", label: "Studio" },
        { href: "/agents-platform", label: "Agents Platform" },
        { href: "/products/dubbing", label: "Dubbing Studio" },
        { href: "/products/voice-library", label: "Voice Library" },
        { href: "/products/image-video", label: "Image & Video" },
        { href: "/pricing", label: "API" },
      ],
    },
    {
      title: "Solutions",
      items: [
        { href: "/pricing", label: "For Teams" },
        { href: "/pricing", label: "For Startups" },
        { href: "/pricing", label: "Retail and E-Commerce" },
        { href: "/pricing", label: "Customer Support" },
        { href: "/agents-platform", label: "AI Voice Agents" },
      ],
    },
    {
      title: "Resources",
      items: [
        { href: "/pricing", label: "Product Guides" },
        { href: "/company/blog", label: "Blog" },
        { href: "/company/safety", label: "Safety" },
        { href: "/terms", label: "Terms" },
        { href: "/privacy", label: "Privacy" },
      ],
    },
    {
      title: "Socials",
      items: [
        { href: "https://twitter.com", label: "X" },
        { href: "https://linkedin.com", label: "LinkedIn" },
        { href: "https://github.com", label: "GitHub" },
        { href: "https://youtube.com", label: "YouTube" },
        { href: "https://discord.com", label: "Discord" },
      ],
    },
    {
      title: "Company",
      items: [
        { href: "/company/about", label: "About" },
        { href: "/company/safety", label: "Safety" },
        { href: "/company/careers", label: "Careers" },
        { href: "/company/blog", label: "Blog" },
        { href: "/company/stories", label: "Customer Stories" },
      ],
    },
  ] as const;

  return (
    <footer className="relative" data-testid="footer-tenlabs">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #000 0%, #050505 100%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-18 pb-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_4fr]" data-testid="grid-footer-main">
          <div className="flex flex-col gap-3" data-testid="footer-brand">
            <div className="flex items-center gap-2" data-testid="footer-brand-row">
              <div
                className="text-[15px] font-semibold tracking-tight text-white"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                data-testid="text-footer-brand"
              >
                TenLabs
              </div>
            </div>
            <button className="inline-flex w-fit items-center gap-2 text-xs text-white/55 hover:text-white/75 transition">
              <span className="text-white/55" aria-hidden>
                ✦
              </span>
              English
            </button>
          </div>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-xs text-white/40">{c.title}</div>
                <div className="mt-4 grid gap-2">
                  {c.items.map((it) => (
                    <Link
                      key={it.href + it.label}
                      href={it.href}
                      className="text-sm text-white/70 hover:text-white transition"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10" />

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/45">
          <div>© {new Date().getFullYear()} TenLabs.ai. All rights reserved.</div>
          <div className="flex flex-wrap gap-4">
            {[
              { href: "/sign-in", label: "Sign in" },
              { href: "/sign-up", label: "Sign up" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
