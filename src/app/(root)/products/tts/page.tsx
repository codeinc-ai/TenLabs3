"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Play, ChevronRight } from "lucide-react";
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
              <div className="text-[13px] tracking-tight text-white/90" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                TenLabs.ai
              </div>
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

const useCards = [
  { title: "Narration", desc: "Expressive voices that bring audiobooks and podcasts to life.", img: "/images/landing/creative-voice-orb-1.jpg" },
  { title: "Conversational", desc: "Natural voices perfect for normal scenarios.", img: "/images/landing/tts-orb-2.jpg" },
  { title: "Characters", desc: "Playful and engaging voices for cartoons or video games.", img: "/images/landing/tts-orb-3.jpg" },
  { title: "Social Media", desc: "Trendy, attention-grabbing voices for short-form content.", img: "/images/landing/tts-orb-4.jpg" },
];

function TtsFaq() {
  const [open, setOpen] = useState<string | null>(null);
  const faq = [
    { q: "What is text to speech (TTS) and how does it work?", a: "TTS converts written text into spoken audio using voice models trained on speech." },
    { q: "What is AI text to speech used for?", a: "Voiceovers, assistants, narration, accessibility, content localization, and more." },
    { q: "How does the TenLabs Text to Speech differ from other TTS technologies?", a: "We focus on expressive delivery, controllability, and voice quality in many languages." },
    { q: "What is the best free text to speech tool?", a: "TenLabs offers a free tier to get started. Try our TTS for high-quality, natural-sounding voices." },
    { q: "How can I convert text to speech free online?", a: "Paste text, choose a voice, generate audio, and export in common formats." },
    { q: "Does TenLabs offer multilingual text to speech?", a: "Yes — dozens of languages and accents, with a growing catalog." },
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

export default function TtsProductPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-10">
            <div className="max-w-3xl">
              <Reveal>
                <div className="text-xs tracking-[0.18em] uppercase text-white/55">TEXT TO SPEECH</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Text to Speech with high quality, human-like AI voices
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Convert Text to Speech</Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/tts">
                      <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Convert Text to Speech</Button>
                    </Link>
                  </SignedIn>
                  <div className="text-xs text-white/45">Trusted by 1M+ users • Free to start</div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative pb-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-4">
              {useCards.map((c, i) => (
                <Reveal key={c.title} delay={0.05 * i}>
                  <Link href="/tts">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6 text-center hover:bg-white/[0.045] transition">
                      <div className="mx-auto relative size-20">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <Image src={c.img} alt="" fill className="object-cover" />
                        </div>
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="size-8 rounded-full bg-white/90 grid place-items-center">
                            <Play className="size-3.5 text-black ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 text-sm font-medium text-white/90">{c.title}</div>
                      <div className="mt-2 text-xs leading-5 text-white/55">{c.desc}</div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div className="mt-8 flex justify-center">
                <Link href="/voices">
                  <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">Explore all 10,000+ Voices</Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="text-center">
                <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Emotionally & contextually aware
                  <br />
                  AI voices for Text to Speech
                </h2>
                <p className="mt-4 text-sm text-white/60 max-w-2xl mx-auto">
                  Our voice AI responds to emotional cues in text and adapts its delivery to suit both the immediate content and the wider context.
                </p>
                <div className="mt-7 flex justify-center">
                  <button className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/80 hover:bg-white/[0.06] transition">
                    <span className="size-9 rounded-xl bg-white text-black grid place-items-center">
                      <Play className="size-4 ml-0.5" />
                    </span>
                    Watch video
                  </button>
                </div>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-12">
              <Reveal delay={0.05} className="md:col-span-7">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="rounded-[22px] border border-white/10 bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-blue-500/10 p-6">
                      <div className="text-xs text-white/70">voice paused for a moment, softly, as if weighing its thoughts before continuing...</div>
                      <div className="mt-5 text-xs text-white/55">Control the emotion, delivery and direction</div>
                      <div className="mt-2 text-xs leading-5 text-white/50">Create controllable, expressive speech layered with emotion, audio events, and immersive soundscapes.</div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-12 items-start">
                      <div className="md:col-span-5 rounded-[18px] border border-white/10 bg-black/30 overflow-hidden">
                        <Image src="/images/landing/tts-controls-panel.jpg" alt="Controls" width={400} height={250} className="w-full h-full object-cover" />
                      </div>
                      <div className="md:col-span-7 rounded-[18px] border border-white/10 bg-black/30 overflow-hidden">
                        <Image src="/images/landing/tts-video-still.jpg" alt="Video" width={500} height={250} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="md:col-span-5">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="text-sm font-medium text-white/90">Access a library of 10,000+ human-like voices</div>
                    <div className="mt-2 text-xs leading-5 text-white/55">Explore an ever-growing collection of diverse, expressive, lifelike voices for any use case.</div>
                    <div className="mt-5 rounded-[20px] border border-white/10 bg-black/30 overflow-hidden">
                      <div className="grid grid-cols-2">
                        <div className="p-3 text-xs text-white/80 border-r border-b border-white/10">Narrative & Story</div>
                        <div className="p-3 text-xs text-white/45 border-b border-white/10">Conversational</div>
                        <div className="aspect-[16/10] col-span-2 bg-black/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-center text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Use cases, from AI Agents to
                <br />
                audiobooks or voiceovers
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                { title: "Conversational Agents", desc: "Use AI text to speech to create natural, human-like voices for chatbots and virtual assistants." },
                { title: "Gaming", desc: "Generate voiceovers for video game characters using text to speech AI.", img: "/images/landing/tts-usecase-gaming.jpg" },
                { title: "Audiobooks", desc: "Convert written text into natural-sounding AI voices for audiobooks.", img: "/images/landing/tts-usecase-audiobook.jpg" },
                { title: "Video voiceovers", desc: "Produce high-quality voiceovers for videos, TV shows, and animation." },
                { title: "Podcasts", desc: "Use AI text to speech for creating podcasts with consistent narration." },
                { title: "Accessibility", desc: "Integrate text to speech into websites and apps to provide audio versions of content." },
              ].map((it, i) => (
                <Reveal key={it.title} delay={0.05 * i}>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                    <div className="p-6">
                      <div className="text-sm font-medium text-white/90">{it.title}</div>
                      <div className="mt-2 text-xs leading-5 text-white/55">{it.desc}</div>
                    </div>
                    {it.img ? (
                      <div className="px-6 pb-6">
                        <Image src={it.img} alt={it.title} width={400} height={200} className="w-full rounded-2xl border border-white/10 object-cover" />
                      </div>
                    ) : (
                      <div className="px-6 pb-6">
                        <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.04]" />
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="text-center">
              <div className="text-xs text-white/45">Millions of words generated every minute</div>
              <Reveal>
                <h2 className="mt-10 text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Generate speech in
                  <br />
                  over 70 languages and
                  <br />
                  wide range of accents
                </h2>
              </Reveal>
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
                  <button className="h-8 rounded-full bg-white text-black px-4 text-xs font-medium">Languages</button>
                  <button className="h-8 rounded-full px-4 text-xs text-white/70 hover:text-white">Accents</button>
                </div>
              </div>
            </div>
            <div className="mt-12 grid gap-10 md:grid-cols-12 items-center">
              <Reveal delay={0.05} className="md:col-span-5">
                <div className="text-xs text-white/45">Most popular languages</div>
                <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  {["English", "Spanish", "German", "Japanese", "Korean", "Chinese"].map((l, idx) => (
                    <div key={l} className={`flex items-center justify-between px-5 py-4 text-sm ${idx !== 0 ? "border-t border-white/10" : ""}`}>
                      <div className="text-white/80">{l}</div>
                      <ChevronRight className="size-4 text-white/35" />
                    </div>
                  ))}
                  <div className="border-t border-white/10 px-5 py-4 text-xs text-white/45">All languages & accents</div>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="md:col-span-7">
                <div className="relative aspect-square rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.18),transparent_55%)]" />
                  <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="size-[62%] rounded-full border border-white/15 bg-gradient-to-br from-blue-400/20 via-rose-400/15 to-orange-400/15 blur-[0.2px]" />
                  </div>
                  <div className="absolute left-6 top-8 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/75">French</div>
                  <div className="absolute right-8 top-10 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/75">Spanish</div>
                  <div className="absolute left-10 bottom-12 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/75">Chinese</div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Models & Testimonials Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="text-center">
              <Reveal>
                <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Built on the most powerful
                  <br />
                  Text to Speech models
                </h2>
              </Reveal>
              <div className="mt-6 flex justify-center">
                <Link href="/docs">
                  <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">Text to Speech API</Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {["Eleven v3", "Multilingual v2", "Flash v2.5", "Turbo v2.5"].map((name, idx) => (
                <Reveal key={name} delay={0.05 * idx}>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                    <div className="h-28 relative">
                      <Image src={`/images/landing/${idx === 0 ? "creative-voice-orb-1" : `tts-orb-${idx + 1}`}.jpg`} alt="" fill className="object-cover" />
                    </div>
                    <div className="p-5">
                      <div className="text-sm font-medium text-white/90">{name}</div>
                      <div className="mt-3 grid gap-2 text-xs text-white/55">
                        <div>70+ languages supported</div>
                        <div>Low latency</div>
                        <div>Multi-speaker support</div>
                      </div>
                      <div className="mt-5">
                        <Link href="/docs">
                          <Button variant="secondary" className="h-9 w-full rounded-full bg-white/5 hover:bg-white/10 border border-white/10">View docs</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-16">
              <Reveal>
                <h3 className="text-center text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Trusted by the World&apos;s Leading
                  <br />
                  Creators & their communities
                </h3>
              </Reveal>
              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {[
                  { quote: "With TenLabs, I've created an AI twin of myself —so anyone can have a life-changing conversation with me.", who: "Creator" },
                  { quote: "Our decision to go with TenLabs was simple. Nothing came close to the natural quality.", who: "Team" },
                  { quote: "We've tested every model. Nothing came close.", who: "Founder" },
                ].map((q, i) => (
                  <Reveal key={q.who} delay={0.05 * i}>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                      <div className="text-sm text-white/70 leading-6">{q.quote}</div>
                      <div className="mt-4 text-xs text-white/45">{q.who}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Explore AI voices Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h3 className="text-xl md:text-2xl font-medium text-white/85">
                Explore our AI voices for Text to Speech
              </h3>
            </Reveal>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {["Audiobook Narrator", "Conversational", "Epic", "News Anchor", "Screaming", "Video Games"].map((label, idx) => (
                <Reveal key={label} delay={0.03 * idx}>
                  <Link href="/voices">
                    <div className="relative rounded-[18px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden group hover:bg-white/[0.05] transition">
                      <div className="absolute inset-0 opacity-70">
                        <Image src={`/images/landing/${(idx % 4) === 0 ? "creative-voice-orb-1" : `tts-orb-${(idx % 4) + 1}`}.jpg`} alt="" fill className="object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
                      <div className="relative p-4">
                        <div className="text-xs text-white/75">{label}</div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Frequently asked questions
              </h2>
            </Reveal>
            <TtsFaq />
          </div>
        </section>
      </main>
    </div>
  );
}
