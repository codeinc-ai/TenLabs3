"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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

function StudioHero() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <h1
                className="text-balance text-[44px] leading-[1.02] tracking-[-0.035em] font-medium"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                AI-powered audio and video editor
              </h1>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-6">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Try Studio</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/studio">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Try Studio</Button>
                  </Link>
                </SignedIn>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <Reveal delay={0.08}>
              <p className="text-[13px] leading-5 text-white/65 max-w-sm">
                Create professional-quality audio and video content with AI voices, music, sound effects, and more — all in one editor.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div
                className="p-6 sm:p-8"
                style={{
                  backgroundImage: "url(/images/landing/studio-hero-gradient.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="rounded-[22px] border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
                  <Image
                    src="/images/landing/studio-editor-mock.jpg"
                    alt="Studio editor"
                    width={1200}
                    height={600}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StudioIntro() {
  const chips = [
    { label: "Text to Speech" },
    { label: "Eleven Music" },
    { label: "AI Sound Effects" },
    { label: "Captions" },
    { label: "Voice Changer" },
    { label: "Transcription" },
    { label: "Voice Isolator" },
    { label: "Video support" },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button className="h-8 rounded-full bg-white text-black px-4 text-xs font-medium">Video</button>
              <button className="h-8 rounded-full px-4 text-xs text-white/70 hover:text-white">Audio</button>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 text-center">
          <Reveal delay={0.05}>
            <div className="text-xs text-white/55">Introducing Studio 3.0</div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              className="mt-4 text-balance text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Create immersive experiences with Studio 3.0 — from
              podcasts and audiobooks to videos. Enhance your content
              with AI voices, music, and captions, all in one editor.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/70">
              {chips.map((c) => (
                <div key={c.label} className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-white/30" />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 flex justify-center">
              <button className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/80 hover:bg-white/[0.05] transition">
                <span className="size-9 rounded-xl bg-white text-black grid place-items-center">
                  <Play className="size-4" />
                </span>
                Watch intro
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StudioFeatureRows() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Row 1: Voiceovers */}
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <div className="text-lg font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>Add new voiceovers</div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-3 text-sm text-white/65">
                Bring your script to life with natural-sounding voiceovers. Choose from over 10,000 voices — realistic accents, character voices, or professional narration — then edit recordings by simply editing the text.
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Reveal delay={0.08}>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-6">
                  <div className="text-xs text-white/50">Select a voice</div>
                  <div className="mt-4 grid gap-3">
                    {["Burt Reynolds", "Enrique Montragón", "Finn"].map((name, idx) => (
                      <div key={name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <div className="size-9 rounded-full bg-white/10 border border-white/10" />
                        <div>
                          <div className="text-sm text-white/85">{name}</div>
                          <div className="text-xs text-white/50">Studio voice</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Row 2: Sound Effects + Speech Correction */}
        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <div className="text-lg font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>Add custom sound effects</div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-3 text-sm text-white/65">
                Enrich your content with any sound effect you can describe with a prompt. From subtle ambience to cinematic impact, add effects directly in Studio for a polished production.
              </div>
            </Reveal>

            <div className="mt-12">
              <Reveal delay={0.1}>
                <div className="text-lg font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>Fix mistakes in seconds with Speech Correction</div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="mt-3 text-sm text-white/65">
                  Edit spoken audio instantly using AI voice cloning. Just change the script, and Studio regenerates the same voice — no re-recording, no extra takes.
                </div>
              </Reveal>
            </div>
          </div>
          <div className="md:col-span-7">
            <Reveal delay={0.08}>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-6">
                  <div className="text-xs text-white/50">Sound Effects</div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="h-10 rounded-xl border border-white/10 bg-white/[0.03] px-3 flex items-center text-xs text-white/45">Describe your sound...</div>
                    <div className="mt-4">
                      <Image src="/images/landing/studio-sfx-panel.jpg" alt="SFX" width={600} height={300} className="w-full rounded-xl border border-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Row 3: Voice Isolator */}
        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <div className="text-lg font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>Clean up noisy audio with Voice Isolator</div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-3 text-sm text-white/65">
                Remove background noise, reverb, and distractions with AI-powered noise reduction. Enhance audio quality so dialogue always sounds clear and professional.
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Reveal delay={0.08}>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-6">
                  <Image src="/images/landing/studio-isolator-panel.jpg" alt="Isolator" width={600} height={300} className="w-full rounded-2xl border border-white/10" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudioBento() {
  const cards = [
    { title: "Timeline", desc: "Trim, merge, and edit audio and video with precision. Sync voiceovers, music, and sound effects on a single intuitive editing timeline." },
    { title: "Video support", desc: "Upload MP4 or MOV files and enhance them with AI. Add voiceovers, background music, sound effects, and auto captions to edit videos online with ease." },
    { title: "Captions", desc: "Generate captions in one click for accessibility and engagement. Customize style, add multilingual subtitles, and sync captions to your audio or video." },
    { title: "Public project URLs", desc: "Share editable links for client or team feedback. Collect time-stamped comments directly on the timeline to streamline collaboration." },
    { title: "32+ Language support", desc: "Produce audio and video in over 30 languages with expressive accents and localized narration tailored to your audience." },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center">
          <Reveal>
            <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              All your creative tools, in one seamless timeline
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-sm text-white/60 max-w-xl mx-auto">
              From captions and collaboration to video editing and multilingual audio, Studio 3.0 combines every tool you need to edit, produce, and share at scale.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          {/* Timeline - large card */}
          <Reveal delay={0.08} className="md:col-span-7">
            <div className="h-full rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
              <div className="text-sm font-medium text-white">{cards[0].title}</div>
              <div className="mt-2 text-xs leading-5 text-white/60">{cards[0].desc}</div>
              <div className="mt-6 h-28 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent" />
            </div>
          </Reveal>

          {/* Video support */}
          <Reveal delay={0.1} className="md:col-span-5">
            <div className="h-full rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
              <div className="text-sm font-medium text-white">{cards[1].title}</div>
              <div className="mt-2 text-xs leading-5 text-white/60">{cards[1].desc}</div>
              <div className="mt-6 h-40 rounded-2xl border border-white/10 bg-black/30 grid place-items-center">
                <div className="size-12 rounded-full bg-white/90 grid place-items-center">
                  <Play className="size-5 text-black" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Captions */}
          <Reveal delay={0.12} className="md:col-span-4">
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
              <div className="text-sm font-medium text-white">{cards[2].title}</div>
              <div className="mt-2 text-xs leading-5 text-white/60">{cards[2].desc}</div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="aspect-[4/3] rounded-xl border border-white/10 bg-white/[0.04]" />
                <div className="aspect-[4/3] rounded-xl border border-white/10 bg-white/[0.04]" />
              </div>
            </div>
          </Reveal>

          {/* Public URLs */}
          <Reveal delay={0.14} className="md:col-span-4">
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
              <div className="text-sm font-medium text-white">{cards[3].title}</div>
              <div className="mt-2 text-xs leading-5 text-white/60">{cards[3].desc}</div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="grid gap-2">
                  <div className="h-9 rounded-xl border border-white/10 bg-white/[0.03]" />
                  <div className="h-9 rounded-xl border border-white/10 bg-white/[0.03]" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Languages */}
          <Reveal delay={0.16} className="md:col-span-4">
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
              <div className="text-sm font-medium text-white">{cards[4].title}</div>
              <div className="mt-2 text-xs leading-5 text-white/60">{cards[4].desc}</div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                {["Spanish", "English", "German", "French", "Irish"].map((l) => (
                  <div key={l} className="flex items-center gap-3 py-2">
                    <div className="size-7 rounded-lg border border-white/10 bg-white/[0.03]" />
                    <div className="text-xs text-white/70">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StudioApiAndFAQ() {
  const faq = [
    { q: "What is Studio designed for?", a: "Producing long-form audio and narrated videos with a timeline editor and integrated AI audio tools." },
    { q: "Does Studio support multilingual audio and captions?", a: "Yes — create multilingual audio and subtitles, and keep timing aligned on the timeline." },
    { q: "Can I assign particular speakers to specific text fragments?", a: "Yes — select voices per segment to maintain consistent speaker identity." },
    { q: "Which file types can I upload?", a: "Common audio/video formats are supported including MP3, WAV, MP4, MOV, and more." },
    { q: "How does Studio integrate with other tools from your ecosystem?", a: "Studio connects with TTS, SFX, transcription, and voice tools in one workflow." },
    { q: "How do I edit video online with Studio?", a: "Upload a video, add voiceovers/music/SFX, then export from the editor." },
    { q: "Can I add voiceover to video?", a: "Yes — generate or upload voice, then align it on the video timeline." },
    { q: "How do I add music to video or audio?", a: "Generate music tracks, then layer them under speech and effects." },
  ];

  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center">
          <Reveal>
            <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Everything in Studio, available through our API
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-sm text-white/60 max-w-2xl mx-auto">
              Access the same voices, music, and audio tools behind Studio 3.0 — programmatically, at scale, in any workflow.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 flex justify-center">
              <Image
                src="/images/landing/studio-api-code.jpg"
                alt="API code"
                width={900}
                height={400}
                className="w-full max-w-3xl rounded-[22px] border border-white/10 bg-white/[0.03]"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-16">
          <Reveal>
            <h3 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Frequently asked questions
            </h3>
          </Reveal>

          <div className="mt-8 border-t border-white/10">
            {faq.map((it) => {
              const isOpen = open === it.q;
              return (
                <button
                  key={it.q}
                  className="w-full text-left py-5 border-b border-white/10 hover:bg-white/[0.02] transition"
                  onClick={() => setOpen(isOpen ? null : it.q)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm md:text-base text-white/85">{it.q}</div>
                    <div className="text-white/50">{isOpen ? "–" : "+"}</div>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 text-sm text-white/60 max-w-3xl">{it.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StudioProductPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <StudioHero />
        <StudioIntro />
        <StudioFeatureRows />
        <StudioBento />
        <StudioApiAndFAQ />
      </main>
    </div>
  );
}
