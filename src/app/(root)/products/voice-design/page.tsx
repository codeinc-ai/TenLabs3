"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowLeft, ArrowRight, VolumeX, Sparkles, Play } from "lucide-react";
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

function VoiceDesignHero() {
  const [prompt, setPrompt] = useState(
    "A calm and husky male warrior with a thick Japanese accent. Soft, whiskey, low tone with a composed and gentle pacing."
  );
  const [preview, setPreview] = useState("Arigatō, Elevenlabs. My Blade is ready.");

  return (
    <section className="bg-black text-white">
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url(/images/landing/voice-design-hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30" />

        <div className="relative mx-auto max-w-6xl px-4 pt-16 md:pt-24 pb-20 md:pb-28">
          <div className="grid gap-10 md:grid-cols-12 items-end">
            <div className="md:col-span-7">
              <Reveal>
                <h1
                  className="text-balance text-[44px] md:text-[56px] leading-[1.02] tracking-[-0.04em] font-medium"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Generate any AI voice you can imagine using just a text prompt
                </h1>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="mt-4 text-sm md:text-base text-white/70 max-w-xl">
                  Customise the tone, accent, age, pacing, and delivery of your voices to create infinite characters with expressive delivery.
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Design a voice</Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/voice-design">
                      <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Design a voice</Button>
                    </Link>
                  </SignedIn>
                  <Button variant="secondary" className="h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white">
                    Watch video
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="md:col-span-5">
              <div className="rounded-[22px] border border-white/15 bg-white/10 backdrop-blur-xl tenlabs-ring overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-end gap-2 text-white/70">
                    <button className="size-8 rounded-full border border-white/15 bg-black/30 hover:bg-black/40 transition">
                      <ArrowLeft className="size-4 mx-auto" />
                    </button>
                    <button className="size-8 rounded-full border border-white/15 bg-black/30 hover:bg-black/40 transition">
                      <ArrowRight className="size-4 mx-auto" />
                    </button>
                    <button className="size-8 rounded-full border border-white/15 bg-black/30 hover:bg-black/40 transition">
                      <VolumeX className="size-4 mx-auto" />
                    </button>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25">
                    <div className="p-4">
                      <div className="text-[11px] text-white/70">Prompt</div>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="mt-2 w-full min-h-[86px] resize-none bg-transparent text-sm text-white/85 outline-none placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="mt-3 rounded-[18px] border border-white/10 bg-black/25">
                    <div className="p-4">
                      <div className="text-[11px] text-white/70">Text to preview</div>
                      <textarea
                        value={preview}
                        onChange={(e) => setPreview(e.target.value)}
                        className="mt-2 w-full min-h-[64px] resize-none bg-transparent text-sm text-white/85 outline-none placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function VoiceDesignIntro() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="flex items-center justify-center gap-3">
            <div className="size-10 rounded-full border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass grid place-items-center">
              <Sparkles className="size-4 text-white/80" />
            </div>
            <div className="h-10 px-4 rounded-full border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass grid place-items-center">
              <span className="text-xs text-white/80">v3</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            className="mt-6 text-center text-3xl md:text-[42px] leading-[1.05] tracking-[-0.03em] font-medium"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            Introducing Voice Design, powered by our
            <br />
            latest Text to Speech v3 model.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-4 text-center text-sm text-white/60 max-w-2xl mx-auto">
            Create lifelike voices from any description — surreal to serious, funny to fierce.
            <br />
            Voice any character and bring your stories to life.
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
            <div className="relative h-[260px] md:h-[340px]">
              <Image
                src="/images/landing/voice-design-collage.png"
                alt="Voice design collage"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
              <button className="absolute left-1/2 -translate-x-1/2 bottom-6 size-12 rounded-full bg-white text-black grid place-items-center shadow-[0_18px_60px_rgba(0,0,0,0.45)] hover:bg-white/90 transition">
                <Play className="size-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function VoiceDesignTry() {
  const cards = [
    {
      img: "/images/landing/voice-design-thumb-zeus.png",
      prompt: "The friendly mythical God, Zeus, with a huge deep powerful voice. Charming, proud, strong and theatrical.",
    },
    {
      img: "/images/landing/voice-design-thumb-noir.png",
      prompt: "A sultry noir detective with a cold, confident tone, crisp pacing, and sharp wit.",
    },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center">
          <Reveal>
            <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Try Voice Design v3
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-3 text-sm text-white/60">
              Create any character imaginable with Voice Design v3.
              <br />
              Available now on TenLabs, free to start.
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/voice-design">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                </Link>
              </SignedIn>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((c, idx) => (
            <Reveal key={idx} delay={0.1 + idx * 0.05}>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Image src={c.img} alt="Voice design example" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/25" />
                  <button className="absolute right-4 top-4 size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur grid place-items-center hover:bg-black/55 transition">
                    <Play className="size-4 text-white" />
                  </button>
                  <div className="absolute left-0 right-0 bottom-0 p-5">
                    <div className="text-sm text-white/85">{c.prompt}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {["/images/landing/voice-design-thumb-alien.png", "/images/landing/voice-design-thumb-witch.png", "/images/landing/voice-design-thumb-cozy.png"].map((img, idx) => (
            <Reveal key={img} delay={0.2 + idx * 0.05} className={idx === 0 ? "md:col-span-2" : ""}>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Image src={img} alt="Voice design example" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/25" />
                  <button className="absolute right-4 top-4 size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur grid place-items-center hover:bg-black/55 transition">
                    <Play className="size-4 text-white" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function VoiceDesignGuides() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Prompt to voice in seconds
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-4 text-sm text-white/60">
                Easily customize the voice by choosing age, gender, and pitch. Fine-tune the emotion, delivery, and overall direction.
                Adjust audio quality and preview your text before generating.
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/voice-design">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                  </Link>
                </SignedIn>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="md:col-span-7">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <Image src="/images/landing/voice-design-ui-panel.png" alt="Voice design" width={600} height={400} className="w-full" />
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Design the perfect AI voice with
                <br />
                our Voice Prompting Guide
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-4 text-sm text-white/60">
                Check out our prompting guide for more details on how to produce the best possible voices for Voice Design, and get inspired by sample prompts to help you get started.
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/voice-design">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">Sign up</Button>
                  </Link>
                </SignedIn>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="md:col-span-7">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <Image src="/images/landing/voice-design-guide-table.png" alt="Voice prompting guide" width={600} height={400} className="w-full" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function VoiceDesignTools() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            Elevate your workflow with
            <br />
            professional AI tools. Start free today
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-6">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">Voice Cloning</div>
              </div>
              <div className="px-6 pb-6">
                <Image src="/images/landing/voice-design-tool-voicecloning.png" alt="Voice cloning" width={500} height={300} className="w-full rounded-2xl border border-white/10" />
              </div>
              <div className="px-6 pb-6 text-sm text-white/65">Automate video voiceovers, ad reads, podcasts, and more, in your own voice</div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-6">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">Text to Speech</div>
              </div>
              <div className="px-6 pb-6">
                <Image src="/images/landing/voice-design-tool-tts.png" alt="Text to Speech" width={500} height={300} className="w-full rounded-2xl border border-white/10" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function VoiceDesignFAQ() {
  const items = [
    { q: "What is TenLabs Voice Design?", a: "Voice Design lets you generate new AI voices from a text prompt, controlling tone, style, and delivery." },
    { q: "Where can I find Voice Design?", a: "In TenLabs, navigate to Create → Voice Design to start generating voices." },
    { q: "When should I use Voice Design versus looking for a voice in the Voice Library?", a: "Use Voice Library when you want to audition existing voices; use Voice Design when you need a brand-new character voice." },
    { q: "What types of voices can I create with Voice Design?", a: "From realistic narration to stylized characters — accents, age, pacing, and emotion are all promptable." },
    { q: "Is there a Voice Design API?", a: "Yes — Voice Design is accessible via API/SDK for programmatic voice generation." },
  ];

  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Frequently asked questions
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 max-w-4xl mx-auto border-t border-white/10">
          {items.map((it) => {
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
                      <div className="pt-3 text-sm text-white/60">{it.a}</div>
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

export default function VoiceDesignPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <VoiceDesignHero />
        <VoiceDesignIntro />
        <VoiceDesignTry />
        <VoiceDesignGuides />
        <VoiceDesignTools />
        <VoiceDesignFAQ />
      </main>
    </div>
  );
}
