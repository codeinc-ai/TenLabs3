"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Play, Waves, Mic, Clipboard, Sparkles } from "lucide-react";
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

function ProductionsHero() {
  const cards = [
    {
      title: "The Climb: The Final Push",
      meta: "Huberman Lab",
      img: "/images/landing/productions-video-1.jpg",
      active: false,
    },
    {
      title: "What makes that documentary\nso unique is that you feel on edge\nthe entire time, even though you\nalready know the climber survives...",
      meta: "Huberman Lab",
      img: "/images/landing/productions-video-2.jpg",
      active: true,
    },
    {
      title: "Episodes & clips",
      meta: "Huberman Lab",
      img: "/images/landing/productions-video-2.jpg",
      active: false,
    },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <Reveal>
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="grid grid-cols-3 gap-4 items-end">
                {cards.map((c, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden",
                      c.active ? "scale-[1.04] shadow-[0_30px_120px_rgba(0,0,0,0.65)]" : "opacity-55 blur-[0.2px]"
                    )}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image src={c.img} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/75" />
                      <div className="absolute top-3 right-3">
                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/80">
                          Ready
                        </div>
                      </div>
                      <div className="absolute left-4 right-4 bottom-3">
                        <div className="text-[11px] text-white/75">{c.meta}</div>
                        <div className="mt-1 text-[11px] leading-4 text-white/90 whitespace-pre-line">{c.title}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 text-center">
            <h1
              className="text-balance text-4xl md:text-5xl leading-[1.05] tracking-[-0.03em] font-medium"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              AI audio, crafted by humans
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto">
              Productions unlocks human-edited transcripts, captions, subtitles, dubs, and
              audiobooks directly in the TenLabs platform. Made for creators and media businesses.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Order a Production</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Order a Production</Button>
                </Link>
              </SignedIn>
              <Link href="/contact">
                <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs text-white/35">
                {["aramco", "stripe", "synthesia", "jpl", "huberman lab"].map((l) => (
                  <div key={l} className="uppercase tracking-[0.18em]">{l}</div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProductionsFeatures() {
  const items = [
    {
      title: "Dubbing",
      desc: "Get natural-sounding dubs. Our localization experts translate and refine every second of audio so your audiences stay fully engaged.",
      icon: <Waves className="size-3.5" />,
    },
    {
      title: "Captions & Subtitles",
      desc: "Professionally translated, formatted, and synced captions and subtitles. Includes SDH features like audio tags to make your videos accessible.",
      icon: <Mic className="size-3.5" />,
    },
    {
      title: "Transcripts",
      desc: "Accurate transcripts matter. Our experts handle audio quality issues and speaker overlap to ensure 99% accuracy.",
      icon: <Clipboard className="size-3.5" />,
    },
    {
      title: "Audiobooks",
      desc: "Make your audiobooks sound natural and engaging from start to finish. Human experts refine AI-generated audiobooks to make sure every line is perfectly delivered.",
      icon: <Sparkles className="size-3.5" />,
    },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <h2
            className="text-center text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            Order human-edited content that
            <br />
            looks, sounds, and feels natural
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <div className="grid gap-14">
              {items.map((it, idx) => (
                <Reveal key={it.title} delay={0.05 * idx}>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-white/85">
                      <span className="size-6 rounded-lg border border-white/10 bg-white/[0.03] grid place-items-center text-white/70">
                        {it.icon}
                      </span>
                      <span>{it.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/60">{it.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1} className="md:col-span-7">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="relative aspect-[4/5] bg-black/30">
                <Image
                  src="/images/landing/productions-video-2.jpg"
                  alt="Video preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/70" />
                <div className="absolute top-4 right-4">
                  <div className="size-10 rounded-full border border-white/10 bg-black/40 backdrop-blur grid place-items-center">
                    <Waves className="size-4 text-white/80" />
                  </div>
                </div>

                <div className="absolute left-5 right-5 bottom-6">
                  <div className="text-xs text-white/70">English · Deutsch</div>
                  <div className="mt-2 text-[13px] leading-5 text-white/85">
                    der als das verlorene
                    <br />
                    tropische Paradies gilt
                    <br />
                    eingefroren in der Zeit.
                  </div>

                  <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/80 hover:bg-white/[0.06] transition">
                    <Play className="size-3.5" />
                    Watch full video
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 px-6 py-5 text-xs text-white/60">
                <div className="flex items-center justify-between">
                  <span>Supported languages</span>
                  <span className="text-white/85">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Turnaround time</span>
                  <span className="text-white/85">48 hours</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProductionsEnterprise() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <Reveal>
              <h3
                className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Fully managed production
                <br />
                services for your Enterprise
              </h3>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-4 text-sm text-white/60">
                Productions is available as an end-to-end service — focus on your business, and let us deliver you top-quality content ready to be distributed to your audiences.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-7">
                <Link href="/contact">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="md:col-span-7">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden p-6">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/50 mb-2">Producer</div>
                  <div className="text-sm text-white/80">Hi! I&apos;ll be your dedicated producer. What content are you looking to localize?</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 ml-auto max-w-[80%]">
                  <div className="text-xs text-white/50 mb-2">You</div>
                  <div className="text-sm text-white/80">We have a documentary series that needs dubbing into 5 languages.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/50 mb-2">Producer</div>
                  <div className="text-sm text-white/80">Perfect! I&apos;ll coordinate with our localization team and get you a quote within 24 hours.</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProductionsFAQ() {
  const faq = [
    { q: "How does Productions work?", a: "Share your content, specify languages and deliverables, and our producer network handles editing, timing, and QA end-to-end." },
    { q: "How much does Productions cost?", a: "Pricing depends on turnaround time, languages, and deliverables. Contact us for a custom quote." },
    { q: "What file formats do you accept?", a: "We accept most common audio and video formats including MP4, MOV, WAV, and MP3." },
    { q: "What languages do you support?", a: "We support 15+ languages with native-speaking producers specializing in local nuance and accessibility requirements." },
    { q: "What is the typical turnaround time?", a: "Standard turnaround is 48 hours. Rush delivery options are available for time-sensitive projects." },
  ];

  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <h2 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            Frequently asked questions
          </h2>
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
    </section>
  );
}

export default function ProductionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <ProductionsHero />
        <ProductionsFeatures />
        <ProductionsEnterprise />
        <ProductionsFAQ />
      </main>
    </div>
  );
}
