"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowRight, Play, Wand2, Shield, Globe } from "lucide-react";
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

function CreativeHero() {
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
                The AI creative platform to bring your content to life
              </h1>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-6 flex flex-wrap gap-3">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Go to Dashboard</Button>
                  </Link>
                </SignedIn>
                <Link href="/contact">
                  <Button variant="secondary" className="h-10 rounded-full bg-white/5 text-white hover:bg-white/10 border border-white/10">
                    Contact sales
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <Reveal delay={0.08}>
              <p className="text-[13px] leading-5 text-white/65 max-w-sm">
                A single platform to generate, edit, and localize premium audio and video in minutes. Powering millions of creators, marketing teams, and media companies worldwide.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Reveal delay={0.1}>
            <Link
              href="/products/tts"
              className="group relative overflow-hidden rounded-[26px] bg-white/[0.03] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] block"
            >
              <div className="relative h-[260px] w-full">
                <Image
                  src="/images/landing/creative-hero-1.jpg"
                  alt="Voiceovers"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.02] opacity-[0.92]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute top-4 right-4 size-8 rounded-full bg-white/95 grid place-items-center shadow-sm">
                <Play className="size-4 text-black" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="text-white text-sm font-medium">Voiceovers</div>
                <ArrowRight className="size-4 text-white/85" />
              </div>
            </Link>
          </Reveal>

          <Reveal delay={0.12}>
            <Link
              href="/products/dubbing"
              className="group relative overflow-hidden rounded-[26px] bg-white/[0.03] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] block"
            >
              <div className="relative h-[260px] w-full">
                <Image
                  src="/images/landing/creative-hero-2.jpg"
                  alt="Localization"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.02] opacity-[0.92]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/85 border border-white/10">
                <span className="size-2 rounded-full bg-red-500" />
                <span>Español</span>
              </div>
              <div className="absolute top-4 right-4 size-8 rounded-full bg-white/95 grid place-items-center shadow-sm">
                <Play className="size-4 text-black" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="text-white text-sm font-medium">Localization</div>
                <ArrowRight className="size-4 text-white/85" />
              </div>
            </Link>
          </Reveal>

          <Reveal delay={0.14}>
            <Link
              href="/products/studio"
              className="group relative overflow-hidden rounded-[26px] bg-white/[0.03] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] block"
            >
              <div className="relative h-[260px] w-full">
                <Image
                  src="/images/landing/creative-hero-3.jpg"
                  alt="Video generation"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.02] opacity-[0.92]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute top-4 right-4 size-8 rounded-full bg-white/95 grid place-items-center shadow-sm">
                <Play className="size-4 text-black" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="text-white text-sm font-medium">Video generation</div>
                <ArrowRight className="size-4 text-white/85" />
              </div>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div className="mt-10 flex items-center justify-center gap-10 text-white/30">
            <div className="text-xs font-medium tracking-wide">EPIC</div>
            <div className="text-xs font-medium tracking-wide">Disney</div>
            <div className="text-xs font-medium tracking-wide">NVIDIA</div>
            <div className="text-xs font-medium tracking-wide">duolingo</div>
            <div className="text-xs font-medium tracking-wide">ASTON MARTIN</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CreativeWorkbench() {
  const [tab, setTab] = useState<"create" | "edit" | "localize">("create");

  const tabs = [
    { id: "create" as const, label: "Create" },
    { id: "edit" as const, label: "Edit" },
    { id: "localize" as const, label: "Localize" },
  ];

  const preview =
    tab === "create"
      ? { title: "What would you like to create?", image: "/images/landing/creative-app-create.jpg", alt: "Create preview" }
      : tab === "edit"
        ? { title: "Arrange, refine, and finalize in Studio", image: "/images/landing/creative-app-edit.jpg", alt: "Edit preview" }
        : { title: "Localize effortlessly across languages", image: "/images/landing/creative-app-localize.jpg", alt: "Localize preview" };

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center">
          <Reveal>
            <h2
              className="text-balance text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium text-white"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Create, edit, and localize with
              <br />
              TenLabs Creative Platform
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto">
              Produce multi-format audio and video, shape it precisely in Studio, and localize effortlessly into 70+ languages for worldwide reach.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
              {tabs.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    className={cn(
                      "relative h-9 rounded-full px-4 text-xs font-medium transition",
                      active ? "bg-white text-black" : "text-white/70 hover:text-white"
                    )}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-4xl rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <div className="text-xs text-white/55">{tab.toUpperCase()}</div>
                <div className="mt-1 text-sm font-medium text-white">{preview.title}</div>
              </div>
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={preview.image}
                      alt={preview.alt}
                      width={800}
                      height={450}
                      className="w-full rounded-2xl border border-white/10"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CreativeBento() {
  const cards = [
    {
      title: "One stack for many ideas",
      desc: "Generate images, videos, voiceovers, music, and SFX from leading models — and iterate instantly to shape new concepts or variations.",
      kind: "stack" as const,
    },
    {
      title: "Browser based Studio",
      desc: "Bring your assets into Studio to mix and finalize — refine with speech, SFX and music from TenLabs' latest audio models.",
      kind: "studio" as const,
    },
    {
      title: "Templates & automation",
      desc: "Skip complex setup with fully engineered presets for results in seconds.",
      icon: <Wand2 className="size-4" />,
    },
    {
      title: "Unified credits & governance",
      desc: "Manage access, permissions, and compliance from one secure workspace.",
      icon: <Shield className="size-4" />,
    },
    {
      title: "Managed Services",
      desc: "Get end-to-end assistance from specialists for complex workflows.",
      icon: <Globe className="size-4" />,
    },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <div className="grid gap-4 md:grid-cols-12">
          {/* One stack for many ideas - large card */}
          <Reveal className="md:col-span-7">
            <div className="h-full rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-6">
                <div className="text-sm font-medium text-white">{cards[0].title}</div>
                <div className="mt-2 text-sm text-white/65">{cards[0].desc}</div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-white text-black px-3 py-1 text-xs font-medium">Create image</div>
                    <div className="rounded-full bg-white/10 text-white px-3 py-1 text-xs">Create video</div>
                    <div className="rounded-full bg-white/10 text-white px-3 py-1 text-xs">Add voiceover</div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="aspect-[4/3] rounded-xl bg-white/[0.04] border border-white/10" />
                    <div className="aspect-[4/3] rounded-xl bg-white/[0.04] border border-white/10" />
                    <div className="aspect-[4/3] rounded-xl bg-white/[0.04] border border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Browser based Studio */}
          <Reveal delay={0.05} className="md:col-span-5">
            <div className="h-full rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-6">
                <div className="text-sm font-medium text-white">{cards[1].title}</div>
                <div className="mt-2 text-sm text-white/65">{cards[1].desc}</div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                  <div className="h-28 bg-gradient-to-b from-white/[0.06] to-transparent" />
                  <div className="px-4 pb-4">
                    <div className="h-10 rounded-xl border border-white/10 bg-white/[0.03]" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Templates & automation */}
          <Reveal delay={0.1} className="md:col-span-4">
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                    {cards[2].icon}
                  </span>
                </div>
                <div className="mt-4 text-sm font-medium text-white">{cards[2].title}</div>
                <div className="mt-2 text-sm text-white/65">{cards[2].desc}</div>
              </div>
            </div>
          </Reveal>

          {/* Unified credits & governance */}
          <Reveal delay={0.12} className="md:col-span-4">
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                    {cards[3].icon}
                  </span>
                </div>
                <div className="mt-4 text-sm font-medium text-white">{cards[3].title}</div>
                <div className="mt-2 text-sm text-white/65">{cards[3].desc}</div>
              </div>
            </div>
          </Reveal>

          {/* Managed Services */}
          <Reveal delay={0.14} className="md:col-span-4">
            <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                    {cards[4].icon}
                  </span>
                </div>
                <div className="mt-4 text-sm font-medium text-white">{cards[4].title}</div>
                <div className="mt-2 text-sm text-white/65">{cards[4].desc}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CreativeVoiceLibraryStrip() {
  const items = [
    { title: "Characters", desc: "Playful and engaging voices for cartoons or video games." },
    { title: "Entertainment", desc: "Broadcast-ready voices for shows, trailers, and promos." },
    { title: "Advertisement Voices", desc: "Persuasive voices that drive action and brand recall." },
    { title: "Narration", desc: "Expressive voices that bring audiobooks and podcasts to life." },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <h2
                className="text-balance text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Find the right voice for
                <br />
                your brand - tap into a
                <br />
                library of 10,000+ voices
              </h2>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/voices">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">
                    Explore Voice Library
                  </Button>
                </Link>
                <Link href="/voices">
                  <Button variant="secondary" className="h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
                    View iconic voices
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <Reveal delay={0.08}>
              <p className="text-[13px] leading-5 text-white/65 max-w-sm">
                Explore a library of 10,000+ human-like AI voices — or license iconic voices from legends, pioneers, and historic figures.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-10 relative">
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
            <div className="size-10 rounded-full border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass grid place-items-center text-white/70 cursor-pointer hover:bg-white/[0.06] transition">‹</div>
          </div>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
            <div className="size-10 rounded-full border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass grid place-items-center text-white/70 cursor-pointer hover:bg-white/[0.06] transition">›</div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {items.map((it, idx) => (
              <Reveal key={it.title} delay={0.05 * idx}>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-5">
                  <div className="grid place-items-center">
                    <div className="relative size-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/landing/creative-voice-orb-1.jpg"
                        alt="Voice orb"
                        fill
                        className="object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/50" />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="size-10 rounded-full bg-white/90 grid place-items-center">
                          <Play className="size-4 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-sm font-medium text-white">{it.title}</div>
                  <div className="mt-2 text-xs leading-5 text-white/60">{it.desc}</div>

                  {idx === 1 && (
                    <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70">
                      Use Voice
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CreativeCalloutsAndFAQ() {
  const callouts = [
    {
      title: "TenLabs Studio",
      desc: "Perfect and finalize your assets in a powerful editor.",
      primary: { label: "Sign up", href: "/sign-up" },
      image: "/images/landing/creative-app-edit.jpg",
    },
    {
      title: "Speech APIs and SDKs",
      desc: "Integrate TenLabs voice features into your product via APIs or SDKs.",
      primary: { label: "Get API key", href: "/developers" },
      secondary: { label: "Explore Docs", href: "/docs" },
      image: "/images/landing/creative-app-create.jpg",
    },
    {
      title: "Create media assets on the go",
      desc: "Generate and refine assets using our iOS and Android apps.",
      primary: { label: "Get the app", href: "/products/mobile" },
      secondary: { label: "Learn more", href: "/products/mobile" },
      image: "/images/landing/creative-app-localize.jpg",
    },
  ];

  const faq = [
    { q: "What is the TenLabs Creative Platform?", a: "A unified workspace for generating, editing, and localizing audio + media assets — designed for professional teams." },
    { q: "What types of content can I create?", a: "Voiceovers, narration, music, sound effects, dubbing, and supporting media assets — all within one workflow." },
    { q: "Is the content generated safe for commercial use?", a: "Yes — content generated with proper licensing is safe for commercial use. Check plan terms for details." },
    { q: "How does localization work?", a: "Upload audio/video, choose target languages, review the transcript, then regenerate segments to match timing and emotion." },
    { q: "Can I create a custom voice for my brand?", a: "Yes — you can design or clone voices, then standardize them across projects and teams." },
  ];

  const [open, setOpen] = useState<string | null>(faq[0].q);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {callouts.map((c, idx) => (
            <Reveal key={c.title} delay={0.05 * idx}>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-6">
                  <div className="text-sm font-medium text-white">{c.title}</div>
                  <div className="mt-2 text-xs leading-5 text-white/60">{c.desc}</div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={c.primary.href}>
                      <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                        {c.primary.label}
                      </Button>
                    </Link>
                    {c.secondary && (
                      <Link href={c.secondary.href}>
                        <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
                          {c.secondary.label}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Image src={c.image} alt="Preview" width={400} height={200} className="w-full rounded-2xl border border-white/10" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <Reveal>
            <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
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
      </div>
    </section>
  );
}

export default function CreativePlatformPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <CreativeHero />
        <CreativeWorkbench />
        <CreativeBento />
        <CreativeVoiceLibraryStrip />
        <CreativeCalloutsAndFAQ />
      </main>
    </div>
  );
}
