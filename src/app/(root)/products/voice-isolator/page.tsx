"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Plus, ChevronRight, Shield } from "lucide-react";
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

export default function VoiceIsolatorProductPage() {
  const [activeTab, setActiveTab] = useState<"examples" | "own">("own");
  const [originalIsolatedTab, setOriginalIsolatedTab] = useState<"original" | "isolated">("original");
  const [modelStep, setModelStep] = useState<1 | 2 | 3>(1);
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-10">
            <div className="grid gap-10 md:grid-cols-12 items-start">
              <div className="md:col-span-7">
                <Reveal>
                  <div className="text-xs tracking-[0.18em] uppercase text-white/55">VOICE ISOLATOR</div>
                </Reveal>
                <Reveal delay={0.05}>
                  <h1 className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Extract crystal-clear speech from any audio
                  </h1>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SignedOut>
                      <Link href="/sign-up">
                        <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/voice-isolator">
                        <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Try Voice Isolator</Button>
                      </Link>
                    </SignedIn>
                    <Link href="/docs">
                      <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">View docs</Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
              <div className="md:col-span-5">
                <Reveal delay={0.08}>
                  <div className="text-sm text-white/65">
                    Remove background noise from any audio and turn it into crisp clear speech perfect for film, podcast, and interview post production.
                  </div>
                </Reveal>
              </div>
            </div>

            <Reveal delay={0.12}>
              <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <div className="text-xs font-medium text-white/80">Isolate voice</div>
                    <div className="mt-1 text-[11px] text-white/50">Try AI voice isolator to remove background noise in seconds</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab("examples")} className={cn("text-[11px] transition", activeTab === "examples" ? "text-white/80" : "text-white/45 hover:text-white/60")}>Examples</button>
                    <button onClick={() => setActiveTab("own")} className={cn("h-8 rounded-full px-4 text-xs font-medium transition", activeTab === "own" ? "bg-white text-black" : "bg-white/5 text-white/70 hover:bg-white/10")}>Isolate your own audio</button>
                  </div>
                </div>
                <div className="bg-white/[0.02]">
                  <div className="mx-auto max-w-4xl px-6 py-10">
                    <div className="grid gap-10 md:grid-cols-2 items-center">
                      <Link href="/voice-isolator">
                        <button className="text-left w-full">
                          <div className="mx-auto size-32 rounded-full border border-white/10 bg-white/[0.03] grid place-items-center hover:bg-white/[0.05] transition">
                            <div className="size-8 rounded-full border border-white/10 grid place-items-center">
                              <Plus className="size-4 text-white/70" />
                            </div>
                          </div>
                          <div className="mt-4 text-center text-xs text-white/60">Upload a recording</div>
                        </button>
                      </Link>
                      <Link href="/voice-isolator">
                        <button className="text-left w-full">
                          <div className="mx-auto size-32 rounded-full overflow-hidden border border-white/10 hover:bg-white/[0.03] transition">
                            <div className="relative w-full h-full">
                              <Image src="/images/landing/isolator-orb.png" alt="Record" fill className="object-cover" />
                            </div>
                          </div>
                          <div className="mt-4 text-center text-xs text-white/60">Record your voice</div>
                        </button>
                      </Link>
                    </div>
                    <div className="mt-8 text-center text-xs text-white/45">
                      Upload an audio file or record it now to remove background noise and turn it into crisp clear speech.
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="mt-16 text-center">
              <Reveal>
                <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Remove background noise
                  <br />
                  with studio-grade precision
                </h2>
                <div className="mt-3 text-sm text-white/60 max-w-xl mx-auto">
                  Voice Isolator uses advanced AI to remove ambient noise, mic feedback, and street sounds from your recordings — leaving only clean, professional audio.
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-12">
              <Reveal className="md:col-span-7">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="rounded-[20px] border border-white/10 bg-black/30 overflow-hidden">
                      <Image src="/images/landing/isolator-video-still.png" alt="Voice isolation example" width={800} height={450} className="w-full aspect-video object-cover" />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={() => setOriginalIsolatedTab("original")} className={cn("h-8 rounded-full px-4 text-xs border border-white/10 transition", originalIsolatedTab === "original" ? "bg-white text-black" : "bg-white/[0.03] text-white/70 hover:text-white")}>Original</button>
                      <button onClick={() => setOriginalIsolatedTab("isolated")} className={cn("h-8 rounded-full px-4 text-xs border border-white/10 transition", originalIsolatedTab === "isolated" ? "bg-white text-black" : "bg-white/[0.03] text-white/70 hover:text-white")}>Isolated</button>
                    </div>
                    <div className="mt-5">
                      <div className="text-sm font-medium text-white">Extract clear speech from any recording</div>
                      <div className="mt-2 text-xs leading-5 text-white/65">Voice Isolator uses AI to separate spoken words from the most chaotic background noise and interference.</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.05} className="md:col-span-5">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="rounded-[20px] border border-white/10 bg-black/30 overflow-hidden">
                      <Image src="/images/landing/isolator-before-after.png" alt="Before and after waveform" width={600} height={300} className="w-full aspect-[2/1] object-cover" />
                    </div>
                    <div className="mt-5">
                      <div className="text-sm font-medium text-white">Remove music, noise or any interference</div>
                      <div className="mt-2 text-xs leading-5 text-white/65">Voice Isolator strips out background music, overlapping conversations, and ambient interference.</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1} className="md:col-span-4">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                  <div className="text-xs text-white/55">Studio-quality voice isolation</div>
                  <div className="mt-2 text-sm text-white/80">Neural speech separation optimized for human voice and minimal artifacts.</div>
                </div>
              </Reveal>
              <Reveal delay={0.12} className="md:col-span-4">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                  <div className="text-xs text-white/55">Multiple audio formats</div>
                  <div className="mt-2 text-sm text-white/80">Supports WAV, MP3, FLAC, OGG, and AAC audio input.</div>
                </div>
              </Reveal>
              <Reveal delay={0.14} className="md:col-span-4">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                  <div className="text-xs text-white/55">Background noise removal</div>
                  <div className="mt-2 text-sm text-white/80">Advanced denoising removes ambient sounds, reverb, and interference.</div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-12 items-start">
              <div className="md:col-span-5">
                <Reveal>
                  <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Studio-grade background
                    <br />
                    noise removal for any use case
                  </h2>
                </Reveal>
              </div>
              <div className="md:col-span-7 text-sm text-white/65">
                <Reveal delay={0.05}>Whether you&apos;re producing a podcast or cleaning up a stream, TenLabs Voice Isolator simplifies post-production and elevates your content.</Reveal>
              </div>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Reveal delay={0.1}>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                  <div className="grid gap-2">
                    {["Record crisp interviews or meetings", "Isolate voice across video content", "Silence copyrighted tracks", "Isolate vocals for music remixes or samples"].map((t, idx) => (
                      <div key={t} className="flex items-center gap-3">
                        <div className="size-6 rounded-full border border-white/10 bg-white/5 grid place-items-center">
                          <ChevronRight className="size-4 text-white/45" />
                        </div>
                        <div className="text-sm text-white/75">{t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[20px] border border-white/10 bg-black/30 overflow-hidden">
                      <Image src="/images/landing/isolator-orb.jpg" alt="Original" width={300} height={200} className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-black/30 overflow-hidden">
                      <Image src="/images/landing/isolator-before-after.jpg" alt="Isolated" width={300} height={200} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-12 items-start">
              <div className="md:col-span-6">
                <Reveal>
                  <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Built on proprietary AI voice
                    <br />
                    research and technology
                  </h2>
                </Reveal>
              </div>
              <div className="md:col-span-6 text-sm text-white/65">
                <Reveal delay={0.05}>We build our own foundational models to make communication seamless, from pioneering human-like voice to advanced audio technologies, all designed with safeguards for responsible use.</Reveal>
              </div>
            </div>
            <Reveal delay={0.1}>
              <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-8 md:p-10">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.02] overflow-hidden">
                    <Image src="/images/landing/isolator-model-diagram.png" alt="Voice isolation model" width={1200} height={500} className="w-full h-auto" />
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-xs font-medium text-white/80">Voice isolation model</div>
                    <div className="mt-2 text-xs text-white/55 max-w-2xl mx-auto">Voice Isolator is built on our deep learning model, trained to separate vocal signals from noise in an audio mix. (Step {modelStep} of 3)</div>
                    <div className="mt-6 flex items-center justify-center gap-2">
                      {([1, 2, 3] as const).map((n) => (
                        <button key={n} onClick={() => setModelStep(n)} className={cn("size-8 rounded-full border border-white/10 text-xs transition", modelStep === n ? "bg-white text-black" : "bg-white/[0.03] text-white/70 hover:text-white")}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
            <div className="mt-20 grid gap-10 md:grid-cols-12 items-start">
              <div className="md:col-span-6">
                <Reveal>
                  <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Enterprise-grade security and
                    <br />
                    infrastructure at scale
                  </h2>
                </Reveal>
                <div className="mt-8 grid gap-4">
                  {[
                    { title: "Enterprise-level data protection", desc: "Data is encrypted in transit and at rest, with support for SOC 2, HIPAA, and GDPR compliance. EU Data Residency and Zero Retention modes are available." },
                    { title: "Granular team permissions", desc: "Fine-grained access control for teams, projects, and integrations." },
                    { title: "Elevated support and custom deployments", desc: "Dedicated support, SLAs, and custom infrastructure options." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <Shield className="mt-0.5 size-5 text-white/55 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white/85">{item.title}</div>
                        <div className="mt-1 text-xs leading-5 text-white/60">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-6">
                <Reveal delay={0.05}>
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                    <Image src="/images/landing/isolator-security-icons.png" alt="Security" width={600} height={400} className="w-full h-auto" />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Reveal>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="text-sm font-medium text-white/90">TenLabs Creative Platform</div>
                    <div className="mt-2 text-xs text-white/60">The best AI audio models in one powerful platform.</div>
                    <div className="mt-5">
                      <SignedOut>
                        <Link href="/sign-up">
                          <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                        </Link>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard">
                          <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">Open Dashboard</Button>
                        </Link>
                      </SignedIn>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Image src="/images/landing/isolator-creative-platform.png" alt="Platform" width={600} height={300} className="w-full rounded-2xl border border-white/10" />
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="text-sm font-medium text-white/90">Text to Speech APIs and SDKs</div>
                    <div className="mt-2 text-xs text-white/60">Integrate TenLabs tools into your product via APIs or SDKs.</div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href="/docs">
                        <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">Explore Docs</Button>
                      </Link>
                      <SignedOut>
                        <Link href="/sign-up">
                          <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">Get API Key</Button>
                        </Link>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard">
                          <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">Get API Key</Button>
                        </Link>
                      </SignedIn>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Image src="/images/landing/isolator-sdk-snippet.png" alt="SDK" width={600} height={300} className="w-full rounded-2xl border border-white/10" />
                  </div>
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
                {[
                  { q: "How much does Voice Isolator cost?", a: "Pricing depends on usage and plan. Contact us for details." },
                  { q: "Is there a maximum file size or length that I can upload to voice isolator?", a: "Limits vary by plan. Check our docs for current limits." },
                  { q: "Does Voice Isolator work with music vocals?", a: "It can separate speech-like vocals from mixes, depending on content and noise profile." },
                  { q: "Can I use Voice Isolator through an API?", a: "Yes — via APIs and SDKs. Explore our documentation for integration guides." },
                ].map((it) => {
                  const isOpen = faqOpen === it.q;
                  return (
                    <button key={it.q} className="w-full text-left py-5 border-b border-white/10 hover:bg-white/[0.02] transition" onClick={() => setFaqOpen(isOpen ? null : it.q)}>
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
