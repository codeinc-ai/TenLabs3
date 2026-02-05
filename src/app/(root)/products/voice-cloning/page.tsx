"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Wand2, Globe, Play, Clipboard, ChevronRight } from "lucide-react";
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
              Voice Cloning
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Create a replica of your
              <br />
              voice that sounds like you
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 text-sm md:text-base text-white/60 max-w-xl">
              Upload a short audio sample and generate natural-sounding speech from text for voiceovers, ads, podcasts, and more — all in your own voice.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/voice-cloning">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                </Link>
              </SignedIn>
              <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
                Explore the docs
              </Button>
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
    "Preview the experience — upload your voice sample and generate natural-sounding speech."
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
              Lily
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-3 text-base text-white/65">
              Graceful female narrator voice
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
          <Reveal key={it.title} delay={0.05 * idx} className={idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5" : "md:col-span-4"}>
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

function Steps() {
  const steps = [
    { title: "Upload Your Audio Sample", desc: "Select the cloning mode and record or upload a clear audio sample." },
    { title: "AI Analyzes Your Voice", desc: "Our artificial intelligence processes your audio files, learning the unique characteristics of your voice." },
    { title: "Generate Natural Speech", desc: "Create speech narrated in your own voice, or use it in Studio to create voiceovers, audiobooks and more." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Reveal>
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            How AI Voice Cloning Works
          </h2>
          <p className="mt-3 text-base text-white/65">
            Our voice cloning tool uses advanced AI and deep learning algorithms to analyze speech patterns, tone, and vocal characteristics from your audio samples.
          </p>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={0.05 * i}>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
              <div className="p-6">
                <div className="text-xs text-white/45">{`0${i + 1}`}</div>
                <div className="mt-3 text-base font-medium text-white">{s.title}</div>
                <div className="mt-2 text-sm text-white/65">{s.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function FAQ() {
  const items = [
    { q: "What is AI voice cloning and how does it work?", a: "AI voice cloning learns patterns from your audio sample (tone, cadence, pronunciation) and uses them to generate speech that sounds like you." },
    { q: "Are there any quality free AI voice cloning tools available?", a: "TenLabs offers a free tier with limits on usage. Upgrade for unlimited access and additional features." },
    { q: "How do I use an AI voice cloning tool?", a: "Upload or record a sample, pick Instant or Professional mode, then generate speech from text or use it in Studio workflows." },
    { q: "What is the difference between instant and professional voice cloning?", a: "Instant cloning is fast with short samples. Professional cloning uses longer/cleaner samples for maximum realism and control." },
    { q: "How secure is AI voice cloning technology?", a: "Our systems include encryption, permission controls, and policy guardrails to ensure your voice data is protected." },
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
                <ChevronRight className={`size-4 text-white/45 transition ${isOpen ? "rotate-90" : ""}`} />
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

export default function VoiceCloningPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <DefaultHero />
        <Demo />
        <Bento
          title={"Meet the most accurate and\nadvanced AI Voice cloning"}
          desc="Create a digital replica of your voice that sounds just like you. Create instant voice clones with just a few seconds of sample audio, or capture very unique accents and vocal traits using our professional voice cloning. Perfect for any use case imaginable."
          items={[
            { title: "Instant Voice Clone", desc: "Create quick, high-quality clones from a short recording.", meta: "IVC" },
            { title: "Professional Voice Clone", desc: "Capture nuance and realism with longer sample sets.", meta: "PVC" },
          ]}
        />
        <Bento
          title={"AI voices that stay\nunmistakably yours"}
          desc="Create lifelike voice clones that carry your tone, emotion, delivery, and personality with unmatched realism."
          items={[
            { title: "Professional Voice Cloning (PVC)", desc: "Capture every nuance of a voice using a dedicated hyper-realistic voice model that's indistinguishable from the original voice.", meta: "PVC" },
            { title: "Instant Voice Cloning (IVC)", desc: "Create a lifelike voice in moments using just a 10-second recording. Ideal for fast, high-quality voice generation.", meta: "IVC" },
            { title: "My cloned voice", desc: "Language, accent, gender, age — configure your clone for your use case.", meta: "Controls" },
          ]}
        />
        <Bento
          title={"AI voice clones for a\nwide range of use cases"}
          desc="Powering everything from long-form narration to real-time dialogue with consistent, human-level quality"
          items={[
            { title: "Audiobooks", desc: "High-quality audiobook narration without expensive studio sessions.", meta: "Use case" },
            { title: "Podcasts", desc: "Fix mistakes, add segments, or create whole episodes using your voice.", meta: "Use case" },
            { title: "Video voiceovers", desc: "Scale production with consistent narration across content.", meta: "Use case" },
          ]}
        />
        <Steps />
        <Bento
          title={"Enterprise-grade security and\ninfrastructure at scale"}
          desc="Enterprise-level data protection, granular team permissions, and elevated support for production workloads."
          items={[
            { title: "Enterprise-level data protection", desc: "Encrypted in transit and at rest with compliance support.", meta: "Security" },
            { title: "Granular team permissions", desc: "Control access across workspaces and teams.", meta: "Admin" },
            { title: "Elevated support", desc: "Priority support and custom deployments.", meta: "Enterprise" },
          ]}
        />
        <FAQ />
      </main>
    </div>
  );
}
