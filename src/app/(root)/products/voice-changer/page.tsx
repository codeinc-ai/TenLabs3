"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Waves, Mic, Globe, Wand2, Play, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing";

function MiniHeader() {
  return (
    <div className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl border-b border-white/5" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <div className="size-8 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
              <AudioLines className="size-4 text-white" strokeWidth={1.8} />
            </div>
            <div className="leading-none">
              <div className="text-[13px] tracking-tight text-white/90" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>TenLabs.ai</div>
              <div className="text-[11px] text-white/50">Creative Platform</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4">Log in</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90 px-4">Sign up</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90 px-4">Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultHero() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-12">
        <div className="max-w-3xl">
          <Reveal>
            <div className="text-xs tracking-[0.18em] uppercase text-white/55">
              AI Voice Changer
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Change your voice while
              <br />
              preserving your style
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 text-sm md:text-base text-white/60 max-w-xl">
              Say it how you want and hear it delivered in a completely different voice, with full control over the performance. Capture whispers, laughs, accents, and subtle emotional cues.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Try for free</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/voice-changer">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Try for free</Button>
                </Link>
              </SignedIn>
              <Link href="/pricing">
                <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
                  View pricing
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  const items = [
    { title: "Performance-preserving", desc: "Keep timing, emotion, and nuance.", icon: <Waves className="size-4" /> },
    { title: "Voice selection", desc: "Choose from a library or design a new voice.", icon: <Mic className="size-4" /> },
    { title: "Studio workflow", desc: "Use changed audio across projects for consistent output.", icon: <Globe className="size-4" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="grid gap-3 md:grid-cols-3 -mt-7 md:-mt-10">
        {items.map((it, idx) => (
          <Reveal key={it.title} delay={idx * 0.05}>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/55">
                  <span className="size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                    {it.icon}
                  </span>
                  <span>Built for production</span>
                </div>
                <div className="mt-3 text-sm font-medium text-white">{it.title}</div>
                <div className="mt-1 text-sm text-white/65">{it.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function FakeWaveform({ intensity = 0.6 }: { intensity?: number }) {
  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);
  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-white/70"
          style={{ height: `${Math.max(8, Math.sin(i * 0.55) * 18 * intensity + 16)}px`, opacity: 0.25 + (i % 5) * 0.08 }}
        />
      ))}
    </div>
  );
}

function Demo() {
  const [playing, setPlaying] = useState(false);
  const [text, setText] = useState(
    "Hey, I booked an appointment for Friday afternoon, but I need to reschedule it to next Tuesday instead, if that's possible please."
  );

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setPlaying(false), 1800);
    return () => window.clearTimeout(id);
  }, [playing]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div>
          <Reveal>
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Voice changer preview
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-3 text-base text-white/65">
              Upload audio and preview a changed-voice result with full control over the performance.
            </p>
          </Reveal>

          <div className="mt-6 grid gap-3">
            <Reveal delay={0.08}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                  <Wand2 className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Professional defaults</div>
                  <div className="mt-1 text-sm text-white/65">Clean controls and clear output previews to communicate value instantly.</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                  <Globe className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Built for teams</div>
                  <div className="mt-1 text-sm text-white/65">Designed for review loops, iteration, and consistent brand voice.</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.12}>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Live preview
                  </div>
                  <div className="text-xs text-white/45">Frontend-only prototype</div>
                </div>

                <button
                  className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white/75 hover:bg-white/10 transition"
                  onClick={() => navigator.clipboard?.writeText(text)}
                >
                  <span className="inline-flex items-center gap-2">
                    <Clipboard className="size-4" /> Copy
                  </span>
                </button>
              </div>

              <div className="my-4 h-px bg-white/10" />

              <div className="grid gap-3">
                <div className="text-xs text-white/55">Text / prompt</div>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="h-12 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
                />

                <button
                  className="h-11 rounded-xl bg-white text-black hover:bg-white/90 transition w-full flex items-center justify-center gap-2"
                  onClick={() => setPlaying(true)}
                >
                  <Play className="size-4" />
                  Generate
                </button>

                <AnimatePresence>
                  {playing && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">Output preview</div>
                        <div className="text-xs text-white/45">mp3 • 44.1kHz</div>
                      </div>
                      <div className="mt-3">
                        <FakeWaveform intensity={0.7} />
                      </div>
                      <div className="mt-3 text-xs text-white/55">
                        Generated audio would appear here.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-white/45">Mode</div>
                    <div className="text-xs text-white/80">v3</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-white/45">Latency</div>
                    <div className="text-xs text-white/80">Studio</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-white/45">Export</div>
                    <div className="text-xs text-white/80">MP3 / WAV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function VoiceChangerFAQ() {
  const faq = [
    { q: "What is Voice Changer?", a: "Voice Changer transforms your voice into a different voice while preserving your performance style, timing, and emotional cues." },
    { q: "How is this different from voice cloning?", a: "Voice Cloning creates a replica of a specific voice. Voice Changer transforms any input voice into a target voice while keeping the performance intact." },
    { q: "Can I use my own custom voices?", a: "Yes — you can choose from the Voice Library or design a new voice using Voice Design." },
    { q: "What file formats are supported?", a: "We support common audio formats including MP3, WAV, and M4A." },
    { q: "Is there an API for Voice Changer?", a: "Yes — Voice Changer is available via API for programmatic access and integration." },
  ];

  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            Frequently asked questions
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-2">
          {faq.map((it) => {
            const isOpen = open === it.q;
            return (
              <button
                key={it.q}
                className="text-left rounded-2xl border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass px-5 py-4 hover:bg-white/[0.05] transition"
                onClick={() => setOpen(isOpen ? null : it.q)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-white/90">{it.q}</div>
                  <div className="text-white/45">{isOpen ? "−" : "+"}</div>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 text-sm text-white/65">{it.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function VoiceChangerPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <DefaultHero />
        <Highlights />
        <Demo />
        <VoiceChangerFAQ />
      </main>
    </div>
  );
}
