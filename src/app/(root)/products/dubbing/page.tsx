"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Wand2, Globe, Play, Clipboard } from "lucide-react";
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
              Dubbing Studio
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Localize content across 29 languages
              <br />
              with AI dubbing
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 text-sm md:text-base text-white/60 max-w-xl">
              Translate audio and video while preserving emotion, timing, tone, and unique characteristics of each speaker.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Start dubbing free</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dubbing">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Start dubbing free</Button>
                </Link>
              </SignedIn>
              <Link href="/pricing">
                <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
                  Explore plans
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
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
    "Drop an audio or video file to preview transcription — timestamps, speakers, and events."
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
              Dubbing Studio
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-3 text-base text-white/65">
              Upload → detect speakers → translate → regenerate clips
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
                <div className="text-xs text-white/55">Prompt / transcript</div>
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
                  Dub
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
                        <div className="text-xs text-white/45">0:00 — 0:12</div>
                      </div>
                      <div className="mt-3">
                        <FakeWaveform intensity={0.7} />
                      </div>
                      <div className="mt-3 text-xs text-white/55">
                        Speaker labels, timestamps, and event tags would appear here.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-white/45">Mode</div>
                    <div className="text-xs text-white/80">Scribe</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-white/45">Latency</div>
                    <div className="text-xs text-white/80">Realtime</div>
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

function Bento({ title, desc, items }: { title: string; desc: string; items: { title: string; desc: string; meta: string }[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Reveal>
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white whitespace-pre-line" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            {title}
          </h2>
          <p className="mt-3 text-base text-white/65">{desc}</p>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-3 md:grid-cols-12">
        {items.map((it, idx) => (
          <Reveal key={it.title} delay={0.05 * idx} className={items.length === 3 ? "md:col-span-4" : items.length === 4 ? "md:col-span-3" : idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5" : "md:col-span-4"}>
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-6">
                <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  {it.meta}
                </div>
                <div className="text-base font-medium text-white">{it.title}</div>
                <div className="mt-2 text-sm text-white/65">{it.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function DubbingFAQ() {
  const items = [
    { q: "What is AI dubbing?", a: "AI dubbing translates audio and video content into different languages while preserving the original speaker's voice, emotion, and timing." },
    { q: "How many languages are supported?", a: "TenLabs supports dubbing in 29 languages with native-level pronunciation and natural delivery." },
    { q: "Can I edit the transcript before dubbing?", a: "Yes — you can manually edit transcripts and translations to ensure your content is properly synced and localized." },
    { q: "How does automatic speaker detection work?", a: "Our AI analyzes your video and automatically recognizes who speaks when, keeping voices matched to the original speakers." },
    { q: "Is there an API for Dubbing Studio?", a: "Yes — Dubbing is available via API for programmatic access and integration with your existing workflows." },
  ];

  const [open, setOpen] = useState<string | null>(items[0].q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Reveal>
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
          Frequently asked questions
        </h2>
      </Reveal>

      <div className="mt-8 grid gap-2">
        {items.map((it) => {
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
  );
}

export default function DubbingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <DefaultHero />
        <Demo />
        <Bento
          title="AI dubbing with original voices"
          desc="Our dubbing tool maintains the original speaker's voice and style across supported languages, ensuring your content remains emotionally and audibly authentic to audiences worldwide."
          items={[
            { title: "Preserve identity", desc: "Keep the original voice characteristics across languages.", meta: "Voice" },
            { title: "Emotion & timing", desc: "Maintain delivery, pacing, and expressive cues.", meta: "Performance" },
            { title: "Multi-language", desc: "Localize at scale while staying consistent.", meta: "Scale" },
          ]}
        />
        <Bento
          title="Instantly dub from any source"
          desc="Upload or link to videos from any platform and start translating right away. Ideal for creators, teams, and global campaigns."
          items={[
            { title: "Upload file", desc: "Drop in audio or video and generate a dub quickly.", meta: "Upload" },
            { title: "Paste a link", desc: "Start from a URL and work in one place.", meta: "URL" },
            { title: "Batch projects", desc: "Scale localization for series and libraries.", meta: "Batch" },
          ]}
        />
        <Bento
          title="Automatic speaker detection"
          desc="Our dubbing AI analyzes your video and automatically recognizes who speaks when — so all voices match the original speakers in content, intonation, and speech duration."
          items={[
            { title: "Detect segments", desc: "Find speaker turns and organize by track.", meta: "Detect" },
            { title: "Match speakers", desc: "Keep speaker identity consistent across scenes.", meta: "Match" },
            { title: "Sync duration", desc: "Maintain pacing so the dub feels natural.", meta: "Sync" },
          ]}
        />
        <Bento
          title="Video transcript and translation editing"
          desc="Manually edit transcripts and translations to ensure your content is properly synced and localized. Adjust voice settings to tune delivery, then regenerate speech segments until the output sounds just right."
          items={[
            { title: "Edit transcript", desc: "Fix words, names, and pacing where needed.", meta: "Edit" },
            { title: "Edit translation", desc: "Refine meaning and style per locale.", meta: "Translate" },
            { title: "Regenerate clips", desc: "Iterate quickly until it matches your intent.", meta: "Iterate" },
          ]}
        />
        <Bento
          title="Tools for precise control"
          desc="Fine-tune every scene with timeline-first editing, clip management, and per-track settings."
          items={[
            { title: "Customize tracks", desc: "Personalize each audio track with stability, similarity, and style.", meta: "Tracks" },
            { title: "Manage clips", desc: "Merge, split, delete, and move clips to match scenes.", meta: "Clips" },
            { title: "Regenerate clips", desc: "Refresh dubs with updated settings or translations.", meta: "Regen" },
            { title: "Flexible timeline", desc: "Adjust clip position for a precise match with on-screen action.", meta: "Timeline" },
          ]}
        />
        <DubbingFAQ />
      </main>
    </div>
  );
}
