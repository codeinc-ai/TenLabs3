"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Play, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function FakeWaveform({ intensity = 0.65 }: { intensity?: number }) {
  const bars = 48;
  return (
    <div className="flex items-end justify-center gap-0.5 h-12">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 0.2 + Math.sin(i * 0.4) * intensity * 0.5 + Math.sin(i * 0.7) * 0.08;
        return <div key={i} className="w-1 rounded-full bg-white/40" style={{ height: `${Math.max(8, h * 100)}%` }} />;
      })}
    </div>
  );
}

const sfxExamplesRow1 = [
  { category: "Sci-fi", title: "Spaceship engine", img: "/images/landing/sfx-card-fantasy.png" },
  { category: "Nature", title: "Rain heard inside a tent", img: "/images/landing/sfx-card-foley.png" },
  { category: "Nature", title: "Ocean waves", img: "/images/landing/sfx-card-waveform.png" },
  { category: "Industrial", title: "Mechanical gear", img: "/images/landing/sfx-card-industrial.png" },
  { category: "Fantasy", title: "Terrifying beam", img: "/images/landing/sfx-card-fantasy.png" },
];

const sfxExamplesRow2 = [
  { category: "Movies", title: "Footsteps on sand", img: "/images/landing/sfx-card-foley.png" },
  { category: "Action", title: "Massive explosion", img: "/images/landing/sfx-card-explosion.png" },
  { category: "Animals", title: "Big cat, small meow", img: "/images/landing/sfx-card-animal.png" },
  { category: "UI", title: "Money notification", img: "/images/landing/sfx-card-money.png" },
];

const sfxFeatures = [
  { title: "Instant generation", desc: "Start generating and get multiple samples within seconds, speeding up your selection and workflow.", img: "/images/landing/sfx-card-foley.png" },
  { title: "Precise control", desc: "Add nuance to your sound effects through precise text descriptions, tailoring each effect to fit your scene.", img: "/images/landing/sfx-card-waveform.png" },
  { title: "Royalty free", desc: "Use your sound effects in your projects worry-free, with no licensing fees or royalties.", img: "/images/landing/sfx-card-waveform.png" },
  { title: "Highest quality audio", desc: "Enjoy clear, high-fidelity sound that enhances your projects with realistic audio.", img: "/images/landing/sfx-card-waveform.png" },
];

const sfxFaq = [
  { q: "How does the Text to Sound Effects model work?", a: "You describe a sound in natural language; the model generates multiple candidate clips that you can audition and iterate on." },
  { q: "What are some primary use cases for this technology?", a: "Film and video post-production, game audio, podcasts, ads, and rapid prototyping for creative teams." },
  { q: "Can I use TenLabs sound effects for commercial projects?", a: "Yes, generated sounds can be used in commercial projects according to your plan terms." },
  { q: "What are royalty-free sound effects?", a: "Royalty-free sound effects can be used in your projects without ongoing per-use licensing fees." },
];

function SfxCategories() {
  const [q, setQ] = useState("");
  const cats = ["Air", "Aircraft", "Alarm", "Ambience", "Animal", "Bell", "Boat", "Booms", "Bullet", "Cartoon", "Communication", "Creature", "Crowd", "Cymbals", "Devices", "Door", "Electricity", "Environment", "Fire", "Foley"];
  return (
    <div>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Explore AI generated sound effects</div>
          <Reveal>
            <h2 className="mt-3 text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Trending and popular sound effect categories
            </h2>
          </Reveal>
        </div>
        <div className="w-full sm:w-[360px]">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search thousands of sound effects…" className="h-11 rounded-full bg-white/5 border-white/10 focus-visible:ring-white/20" />
        </div>
      </div>
      <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {cats.filter((c) => (q ? c.toLowerCase().includes(q.toLowerCase()) : true)).map((c) => (
          <Link key={c} href="/sound-effects" className="group flex items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass px-4 py-2 text-xs text-white/80 hover:bg-white/[0.06] transition">
            <span>{c}</span>
            <ArrowUpRight className="size-4 text-white/35 group-hover:text-white/60" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SfxProductPage() {
  const [prompt, setPrompt] = useState("Big footsteps on sand, applause, or a car horn.");
  const [pro, setPro] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!generating) return;
    const id = window.setTimeout(() => setGenerating(false), 1200);
    return () => window.clearTimeout(id);
  }, [generating]);

  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-24 pb-10">
            <div className="text-center">
              <Reveal>
                <h1 className="text-balance text-[44px] md:text-[56px] leading-[1.02] tracking-[-0.04em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  Generate any sound effects imaginable
                  <br />
                  from a text prompt
                </h1>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="mt-4 text-sm md:text-base text-white/60">Create custom sound effects and ambient audio with our powerful AI sound effect generator.</div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-8 flex justify-center">
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Generate sounds free</Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/sound-effects">
                      <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Generate sounds free</Button>
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mt-12">
              <div className="mx-auto max-w-3xl rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Generate your own sound effect</div>
                  <div className="mt-3">
                    <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="h-12 bg-black/30 border-white/10 focus-visible:ring-white/20 rounded-xl" placeholder="Big footsteps on sand, applause, or a car horn." />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90" onClick={() => setGenerating(true)}>{generating ? "Generating…" : "Generate"}</Button>
                      <div className="flex items-center gap-2 text-[11px] text-white/55">
                        <button className={cn("h-5 w-9 rounded-full border border-white/10 transition relative", pro ? "bg-white" : "bg-white/5")} onClick={() => setPro((v) => !v)} aria-label="Toggle pro mode">
                          <span className={cn("absolute top-1/2 -translate-y-1/2 size-4 rounded-full transition", pro ? "left-[18px] bg-black" : "left-[2px] bg-white")} />
                        </button>
                        <span>{pro ? "On" : "Off"}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-white/45">{pro ? "Pro mode: richer texture" : "Standard mode"}</div>
                  </div>
                  <AnimatePresence>
                    {generating && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="overflow-hidden">
                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-white">Preview</div>
                            <div className="text-[11px] text-white/45">wav • 3.2s</div>
                          </div>
                          <div className="mt-3">
                            <FakeWaveform intensity={0.65} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <div className="mt-10">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Explore AI generated sound effects</div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.02] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="grid sm:grid-cols-2 lg:grid-cols-6">
                  {sfxExamplesRow1.map((c, i) => (
                    <Link key={i} href="/sound-effects" className={cn("relative min-h-[132px] md:min-h-[160px] border-white/10 p-4 text-left transition hover:bg-white/[0.03]", "border-t sm:border-t-0 sm:border-l", i === 0 && "sm:border-l-0")}>
                      <div className="absolute inset-0 opacity-[0.24]">
                        <Image src={c.img} alt="" fill className="object-cover" />
                      </div>
                      <div className="relative">
                        <div className="h-10" />
                        <div className="text-[11px] text-white/50">{c.category}</div>
                        <div className="mt-1 text-sm text-white/85">{c.title}</div>
                      </div>
                      <div className="absolute top-4 right-4 size-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <Play className="size-4 text-white" />
                      </div>
                    </Link>
                  ))}
                  <Link href="/sound-effects" className="relative min-h-[132px] md:min-h-[160px] border-white/10 p-4 text-left transition hover:bg-white/[0.03] sm:border-l">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-black/50" />
                    <div className="relative flex flex-col items-center justify-center h-full">
                      <div className="size-12 rounded-full border border-white/20 flex items-center justify-center">
                        <Plus className="size-6 text-white" />
                      </div>
                      <div className="mt-3 text-sm font-medium text-white">Create your own</div>
                    </div>
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sfxExamplesRow2.map((c, i) => (
                  <Link key={i} href="/sound-effects" className="relative min-h-[96px] md:min-h-[110px] rounded-[18px] border border-white/10 bg-white/[0.02] tenlabs-ring tenlabs-glass p-4 text-left overflow-hidden hover:bg-white/[0.04] transition">
                    <div className="absolute inset-0 opacity-[0.2]">
                      <Image src={c.img} alt="" fill className="object-cover" />
                    </div>
                    <div className="relative">
                      <div className="text-[11px] text-white/50">{c.category}</div>
                      <div className="mt-1 text-sm text-white/85">{c.title}</div>
                    </div>
                    <div className="absolute top-4 right-4 size-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                      <Play className="size-4 text-white" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-6 md:grid-cols-4">
              {sfxFeatures.map((f, i) => (
                <Reveal key={f.title} delay={0.05 * i}>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                    <div className="relative h-[110px] border-b border-white/10">
                      <Image src={f.img} alt="" fill className="object-cover opacity-90" />
                    </div>
                    <div className="p-5">
                      <div className="text-sm font-medium text-white">{f.title}</div>
                      <div className="mt-2 text-xs leading-5 text-white/65">{f.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <SfxCategories />
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">FAQ</div>
                <h2 className="mt-4 text-2xl md:text-4xl font-medium tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>Frequently asked questions</h2>
              </div>
            </Reveal>
            <div className="mt-10 max-w-3xl mx-auto border-t border-white/10">
              {sfxFaq.map((item, i) => (
                <Reveal key={item.q} delay={0.03 * i}>
                  <div className="py-5 border-b border-white/10 last:border-b-0">
                    <div className="text-sm font-medium text-white">{item.q}</div>
                    <div className="mt-2 text-sm text-white/60">{item.a}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0" style={{ background: "#050505" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="text-2xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>Ready to create sound effects?</div>
                  <div className="mt-2 text-sm text-white/60">Start generating custom sounds for your projects today.</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button className="bg-white text-black hover:bg-white/90">Generate sounds free</Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/sound-effects">
                      <Button className="bg-white text-black hover:bg-white/90">Open Sound Effects</Button>
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
