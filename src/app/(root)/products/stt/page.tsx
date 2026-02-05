"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowUpRight, Mic } from "lucide-react";
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

function SttFaq() {
  const [open, setOpen] = useState<string | null>(null);
  const faq = [
    { q: "What languages does Scribe support?", a: "Scribe supports 90+ languages." },
    { q: "What is Speech to Text and how does it work?", a: "Speech to Text converts spoken audio into written text using transcription models." },
    { q: "How do I transcribe video to text?", a: "Upload a video/audio file and generate a transcript with timestamps for editing and export." },
    { q: "How much does Scribe cost?", a: "Pricing depends on volume and latency requirements. Check our pricing page for details." },
    { q: "Can I generate captions for social media videos?", a: "Yes — export timestamps and captions formats for common platforms." },
    { q: "What is the most accurate Speech to Text model?", a: "Scribe v2 is positioned as the most accurate model in the TenLabs lineup." },
  ];
  return (
    <div className="mt-8 border-t border-white/10">
      {faq.map((it) => {
        const isOpen = open === it.q;
        return (
          <button key={it.q} className="w-full text-left py-5 border-b border-white/10 hover:bg-white/[0.02] transition" onClick={() => setOpen(isOpen ? null : it.q)}>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm md:text-base text-white/85">{it.q}</div>
              <div className="text-white/50">{isOpen ? "–" : "+"}</div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="overflow-hidden">
                  <div className="pt-3 text-sm text-white/60 max-w-3xl">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}

export default function SttProductPage() {
  const [mode, setMode] = useState<"realtime" | "scribe">("realtime");

  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-10">
            <div className="grid gap-10 md:grid-cols-12 items-start">
              <div className="md:col-span-7">
                <Reveal>
                  <div className="text-xs tracking-[0.18em] uppercase text-white/55">REALTIME SPEECH TO TEXT</div>
                </Reveal>
                <Reveal delay={0.05}>
                  <h1 className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Transcribe live speech instantly.
                  </h1>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SignedOut>
                      <Link href="/sign-up">
                        <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Start transcribing</Button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/stt">
                        <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Start transcribing</Button>
                      </Link>
                    </SignedIn>
                    <Link href="/docs">
                      <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">Explore the docs</Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
              <div className="md:col-span-5">
                <Reveal delay={0.08}>
                  <div className="text-sm text-white/70">
                    Scribe v2 is the most accurate Speech to Text model. Scribe v2 Realtime sets the benchmark for live transcriptions — powering agents and real-time applications. Both available via API.
                  </div>
                </Reveal>
                <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
                  <button onClick={() => setMode("realtime")} className={cn("h-8 rounded-full px-4 text-xs font-medium transition", mode === "realtime" ? "bg-white text-black" : "text-white/70 hover:text-white")}>
                    Scribe v2 Realtime
                  </button>
                  <button onClick={() => setMode("scribe")} className={cn("h-8 rounded-full px-4 text-xs font-medium transition", mode === "scribe" ? "bg-white text-black" : "text-white/70 hover:text-white")}>
                    Scribe v2
                  </button>
                </div>
              </div>
            </div>

            <Reveal delay={0.12}>
              <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="relative px-6 py-10 md:px-10 md:py-12 min-h-[280px]">
                  <div className="absolute inset-0">
                    <Image src="/images/landing/stt-hero-gradient.jpg" alt="" fill className="object-cover opacity-90" />
                    <div className="absolute inset-0 bg-black/35" />
                  </div>
                  <div className="relative mx-auto max-w-2xl">
                    <Link href="/stt">
                      <button className="w-full rounded-[18px] border border-white/10 bg-white text-black px-6 py-10 shadow-[0_30px_90px_rgba(0,0,0,0.45)] hover:shadow-[0_40px_120px_rgba(0,0,0,0.55)] transition">
                        <div className="mx-auto size-12 rounded-full border border-black/10 grid place-items-center">
                          <Mic className="size-5 text-black/70" />
                        </div>
                        <div className="mt-4 text-sm font-medium text-black/80">Click to start transcribing</div>
                        <div className="mt-1 text-xs text-black/55">Experience the power of {mode === "realtime" ? "Scribe v2 Realtime" : "Scribe v2"}</div>
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="border-t border-white/10 px-4 py-4">
                  <div className="flex items-center justify-center gap-10 text-xs text-white/35">
                    <span>Lovable</span><span>Jamie</span><span>Cars</span><span>Fieldy</span><span>Xolo</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-12 items-start">
              <div className="md:col-span-5">
                <Reveal>
                  <div className="text-xs tracking-[0.18em] uppercase text-white/55">SCRIBE V2 REALTIME</div>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 className="mt-4 text-balance text-[34px] md:text-[40px] leading-[1.06] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Real-time Speech to Text in under
                    <br />
                    150 ms with Scribe v2 Realtime
                  </h2>
                </Reveal>
                <Reveal delay={0.08}>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SignedOut>
                      <Link href="/sign-up">
                        <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">Try it now</Button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/stt">
                        <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">Try it now</Button>
                      </Link>
                    </SignedIn>
                    <Link href="/docs">
                      <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">Learn more</Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
              <div className="md:col-span-7 text-sm text-white/65">
                <Reveal delay={0.06}>Scribe v2 Realtime uses a streaming-first architecture to turn live speech to text instantly, across 90+ languages.</Reveal>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-12">
              <Reveal delay={0.1} className="md:col-span-6">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="relative p-6 min-h-[320px]" style={{ backgroundImage: "url(/images/landing/stt-chat-preview.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
                    <div className="absolute left-6 top-6 rounded-full border border-white/15 bg-black/30 backdrop-blur px-3 py-1 text-xs text-white/70">Live</div>
                    <div className="absolute left-6 top-16 max-w-[260px] rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-[12px] text-black/80 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">I&apos;m happy to help. What&apos;s your email address?</div>
                    <div className="absolute right-6 top-28 max-w-[220px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur px-4 py-3 text-[12px] text-white/80">it&apos;s john.doe@me.com</div>
                    <div className="absolute left-0 right-0 bottom-0 p-6">
                      <div className="text-sm font-medium text-white">Transcribe live speech</div>
                      <div className="mt-2 text-xs leading-5 text-white/65">Scribe v2 Realtime captures live speech in under 150 ms with exceptional accuracy — built for agents, meetings, and AI Apps that demand instant understanding.</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.12} className="md:col-span-6">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="rounded-[18px] border border-white/10 bg-white overflow-hidden">
                      <Image src="/images/landing/stt-accuracy-chart.jpg" alt="Accuracy chart" width={600} height={300} className="w-full h-auto" />
                    </div>
                    <div className="mt-5">
                      <div className="text-sm font-medium text-white">High accuracy and ultra-low latency</div>
                      <div className="mt-2 text-xs leading-5 text-white/65">Scribe v2 Realtime delivers industry-leading accuracy with sub-150 ms latency, setting a new benchmark for real-time speech recognition.</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                { title: "Voice Activity Detection", desc: "Automatically detect when speech starts and stops, segmenting speech with precision for smoother live processing." },
                { title: "Transcribe in 90+ languages", desc: "Delivering exceptional accuracy across accents, dialects, and recording conditions." },
                { title: "Live in the API", desc: "Build Scribe v2 Realtime into your products with the API, with full-streaming support and commit control." },
              ].map((s, i) => (
                <Reveal key={s.title} delay={0.14 + i * 0.02}>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                    <div className="text-sm font-medium text-white/90">{s.title}</div>
                    <div className="mt-2 text-xs leading-5 text-white/60">{s.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                AI Speech to Text transcription across 90+ languages
              </h2>
            </Reveal>
            <div className="mt-3 text-sm text-white/60 max-w-2xl">
              Our AI speech to text transcription supports 90+ languages, just select the language and upload your audio file.
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                "Afrikaans", "Amharic", "Arabic", "Armenian", "Assamese", "Azerbaijani", "Belarusian", "Bengali", "Bosnian", "Bulgarian",
                "Burmese", "Cantonese", "Catalan", "Central Kurdish", "Chinese", "Croatian", "Czech", "Danish", "Dutch", "English",
                "Estonian", "Filipino", "Finnish", "French", "Galician", "Ganda", "Georgian", "German", "Greek", "Gujarati",
                "Hausa", "Hebrew", "Hindi", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese",
                "Javanese", "Kannada", "Kazakh", "Khmer", "Kyrgyz", "Korean", "Lao", "Latvian", "Lingala", "Lithuanian",
                "Luxembourgish", "Macedonian", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Nepali", "Norwegian",
                "Occitan", "Oriya", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian",
                "Shona", "Sindhi", "Slovak", "Somali", "Spanish", "Swahili", "Swedish", "Tamil", "Telugu", "Thai",
                "Turkish", "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Wolof", "Xhosa", "Zulu",
              ].map((l) => (
                <button
                  key={l}
                  className="group flex items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass px-4 py-2 text-xs text-white/80 hover:bg-white/[0.06] transition"
                >
                  <span className="truncate">{l}</span>
                  <ArrowUpRight className="size-4 shrink-0 text-white/35 group-hover:text-white/60" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Built for every workflow,
                <br />
                from API to agents
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { title: "Speech to Text APIs and SDKs", desc: "Integrate Scribe v2 and Scribe v2 Realtime into your product with the API or SDKs.", cta1: "Get API key", cta2: "Explore docs", img: "/images/landing/stt-code-snippet.jpg" },
                { title: "TenLabs Agents", desc: "Enable real-time voice interactions with instant, low-latency transcription.", cta1: "Create Agent", cta2: "Explore Docs", img: "/images/landing/stt-chat-preview.jpg" },
                { title: "TenLabs Studio", desc: "Convert recordings into editable text, captions, and repurposable content.", cta1: "Try Studio", cta2: "", img: "/images/landing/studio-editor-mock.jpg" },
              ].map((c, i) => (
                <Reveal key={c.title} delay={0.05 * i}>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                    <div className="p-6">
                      <div className="text-sm font-medium text-white/90">{c.title}</div>
                      <div className="mt-2 text-xs leading-5 text-white/60">{c.desc}</div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <SignedOut>
                          <Link href="/sign-up">
                            <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">{c.cta1}</Button>
                          </Link>
                        </SignedOut>
                        <SignedIn>
                          <Link href="/stt">
                            <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">{c.cta1}</Button>
                          </Link>
                        </SignedIn>
                        {c.cta2 && (
                          <Link href="/docs">
                            <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">{c.cta2}</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <Image src={c.img} alt={c.title} width={400} height={200} className="w-full rounded-2xl border border-white/10 object-cover" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-16">
              <Reveal>
                <h3 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Frequently asked questions
                </h3>
              </Reveal>
              <SttFaq />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
