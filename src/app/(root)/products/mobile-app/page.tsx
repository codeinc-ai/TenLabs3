"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines } from "lucide-react";
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

function MobileHero() {
  const floating = [
    { text: "Hey Chris... Knock knock [chuckles] I'm not doing this AGAIN.", side: "left" },
    { text: "We're off under the lights here for this semi-final clash.", side: "right" },
    { text: "Ah, the open ocean. Smell that, lad? That's the scent of freedom...", side: "left" },
    { text: "Okay, so it's finally been level 42 of that game I can't get past...", side: "right" },
  ];

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-12">
        <div className="max-w-2xl">
          <Reveal>
            <div className="text-xs tracking-[0.18em] uppercase text-white/55">
              ELEVENLABS MOBILE APP
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="mt-4 text-balance text-[44px] md:text-[54px] leading-[1.02] tracking-[-0.04em] font-medium"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Create scroll-stopping voiceovers in seconds
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 text-sm md:text-base text-white/60 max-w-xl">
              Turn your scripts into expressive audio using thousands of voices in over 70 languages — right from your phone.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">
                    Try for free on iOS & Android
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">
                    Try for free on iOS & Android
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 relative">
            {/* Floating text bubbles - left */}
            <div className="absolute -left-6 -top-2 hidden md:block">
              <div className="grid gap-3">
                {floating.filter((f) => f.side === "left").map((f, idx) => (
                  <div key={idx} className="max-w-[280px] rounded-2xl border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass px-4 py-3 text-[11px] leading-4 text-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating text bubbles - right */}
            <div className="absolute -right-6 top-4 hidden md:block">
              <div className="grid gap-3">
                {floating.filter((f) => f.side === "right").map((f, idx) => (
                  <div key={idx} className="max-w-[280px] rounded-2xl border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass px-4 py-3 text-[11px] leading-4 text-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="relative rounded-[32px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url(/images/landing/mobile-gradient-2.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative px-6 py-10 md:px-10 md:py-14">
                  <div className="grid gap-6 md:grid-cols-12 items-end">
                    <div className="md:col-span-7">
                      <div className="relative mx-auto w-[300px] md:w-[340px]">
                        <div className="absolute inset-0 rounded-[44px] bg-black/10 blur-2xl" />
                        <div className="rounded-[44px] border border-white/15 bg-black/20 backdrop-blur overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
                          <Image
                            src="/images/landing/mobile-hero-phone.jpg"
                            alt="Mobile app"
                            width={340}
                            height={700}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <div className="inline-flex items-start gap-4 rounded-2xl border border-white/10 bg-black/30 backdrop-blur px-4 py-4">
                        <Image
                          src="/images/landing/mobile-qr-promo.jpg"
                          alt="QR"
                          width={80}
                          height={80}
                          className="size-20 rounded-xl border border-white/10 object-cover"
                        />
                        <div>
                          <div className="text-xs text-white/75">Get the app</div>
                          <div className="mt-1 text-[11px] text-white/50">Scan to download for iOS & Android.</div>
                          <Button variant="secondary" className="mt-3 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs">
                            Get the app
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MobileSectionVoiceovers() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Add engaging voiceovers in
                <br />
                seconds
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-4 text-sm text-white/60">
                Turn any script into lifelike speech and drop it straight into your videos.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-7">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                      Try for free
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                      Try for free
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="md:col-span-7">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div
                className="p-8"
                style={{
                  backgroundImage: "url(/images/landing/mobile-gradient-1.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="mx-auto max-w-sm rounded-[36px] border border-white/15 bg-white/90 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                  <Image
                    src="/images/landing/mobile-hero-phone.jpg"
                    alt="Phone"
                    width={340}
                    height={700}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MobileSectionVoices() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          <Reveal className="md:col-span-7">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div
                className="p-8"
                style={{
                  backgroundImage: "url(/images/landing/mobile-gradient-2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="mx-auto max-w-sm rounded-[36px] border border-white/15 bg-white/90 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                  <Image
                    src="/images/landing/mobile-voices-phone.jpg"
                    alt="Voices"
                    width={340}
                    height={700}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <div className="md:col-span-5">
            <Reveal delay={0.05}>
              <h2 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Create with thousands of voices
                <br />
                in 70+ languages
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-4 text-sm text-white/60">
                Use 1000s of expressive voices, including your own clone, to match any accent, style or audience.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-7">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                      Try for free
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                      Try for free
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileSectionShare() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 items-end">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Share instantly to your favorite
                <br />
                apps
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-4 text-sm text-white/60">
                Export your voiceovers to photo and video editing tools, keeping your workflow fast and fluid.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-7">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                      Try for free
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90">
                      Try for free
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="md:col-span-7">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-8">
                <div className="mx-auto max-w-md rounded-[22px] border border-white/10 bg-black/30 backdrop-blur overflow-hidden">
                  <Image
                    src="/images/landing/mobile-share-sheet.jpg"
                    alt="Share sheet"
                    width={400}
                    height={300}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MobileDownload() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <Reveal>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="grid gap-10 md:grid-cols-12 items-center">
                <div className="md:col-span-5">
                  <h3 className="text-2xl md:text-[34px] leading-[1.1] tracking-[-0.03em] font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Download the app, and take
                    <br />
                    your voices anywhere.
                  </h3>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="size-20 rounded-xl bg-white/10 border border-white/10" />
                    </div>
                    <div className="grid gap-2">
                      <div className="h-10 w-36 rounded-xl border border-white/10 bg-white/[0.06] grid place-items-center text-xs text-white/60">App Store</div>
                      <div className="h-10 w-36 rounded-xl border border-white/10 bg-white/[0.06] grid place-items-center text-xs text-white/60">Google Play</div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7">
                  <div className="relative h-[220px]">
                    <div className="absolute right-0 top-0 w-[300px] rounded-[32px] border border-white/10 bg-white/[0.04] overflow-hidden">
                      <Image src="/images/landing/mobile-hero-phone.jpg" alt="Phone" width={300} height={600} className="w-full" />
                    </div>
                    <div className="absolute right-[140px] top-[30px] w-[260px] rounded-[32px] border border-white/10 bg-white/[0.04] overflow-hidden">
                      <Image src="/images/landing/mobile-voices-phone.jpg" alt="Phone" width={260} height={520} className="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />
      <main>
        <MobileHero />
        <MobileSectionVoiceovers />
        <MobileSectionVoices />
        <MobileSectionShare />
        <MobileDownload />
      </main>
    </div>
  );
}
