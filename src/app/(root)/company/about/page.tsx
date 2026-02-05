"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowRight } from "lucide-react";

function TopBar({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl border-b border-white/5" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-xl tenlabs-glass tenlabs-ring grid place-items-center">
              <AudioLines className="size-4 text-white" strokeWidth={1.8} />
            </div>
            <div className="leading-none">
              <div className="text-[13px] tracking-tight text-white/90" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                TenLabs.ai
              </div>
              <div className="text-[11px] text-white/50">{label}</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="h-9 px-4 rounded-full bg-white text-black hover:bg-white/90 transition">
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="h-9 px-4 rounded-full bg-white text-black hover:bg-white/90 transition">
                  Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function BackToResources() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition">
        ← Back to Home
      </Link>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar label="About" />

      <main>
        {/* Hero Section */}
        <section className="relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1200px 700px at 50% -40%, rgba(255,255,255,0.16), rgba(0,0,0,0) 60%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pt-14 md:pt-18">
            <BackToResources />

            <div className="mt-10">
              <Reveal>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">About</div>
              </Reveal>
              <Reveal delay={0.06}>
                <h1
                  className="mt-3 text-balance text-4xl md:text-6xl font-semibold tracking-tight leading-[1.03]"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  AI research and products that transform
                  <br />
                  how we interact with technology
                </h1>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <div className="mt-10 rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.03] tenlabs-ring">
                <div className="h-[280px] sm:h-[420px] w-full bg-gradient-to-br from-white/10 to-white/0 grid place-items-center">
                  <div className="text-2xl font-semibold text-white/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Team Photo
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Investors Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-black/45">About</div>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="h-9 px-3 rounded-full bg-black text-white hover:bg-black/90 transition inline-flex items-center">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>

            <Reveal>
              <h2
                className="mt-12 text-center text-2xl md:text-4xl font-medium tracking-tight text-black"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                We&apos;re backed by leading names
              </h2>
            </Reveal>

            <div className="mt-10 rounded-[22px] border border-black/10 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 md:h-24 border-r border-b border-black/10 grid place-items-center text-black/35"
                  >
                    <div className="text-xs tracking-[0.22em] uppercase">
                      {i % 4 === 0 ? "Iconiq" : i % 4 === 1 ? "Sequoia" : i % 4 === 2 ? "NFX" : "Endeavor"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-3xl text-[15px] leading-7 text-black/70">
              <p>TenLabs is an AI research and product company transforming how we interact with technology.</p>
              <p className="mt-5">
                Our vision is to make communication and creation with technology seamless. We started by building
                human-like voice models, and we&apos;re expanding into tools that help teams create, localize, and ship
                audio experiences.
              </p>
              <div className="mt-7">
                <div className="font-medium text-black">We build three platforms:</div>
                <ul className="mt-3 space-y-3 list-disc pl-5">
                  <li>
                    <span className="font-medium text-black">TenAgents</span> enables businesses to deliver seamless and
                    intelligent customer experiences — with integrations, testing, monitoring, and reliability.
                  </li>
                  <li>
                    <span className="font-medium text-black">TenCreative</span> empowers creators and marketers to
                    generate and edit speech and audio across many languages.
                  </li>
                  <li>
                    <span className="font-medium text-black">TenAPI</span> gives developers access to our foundational
                    audio models.
                  </li>
                </ul>
              </div>
              <p className="mt-7">
                We provide free licenses to those who need it most through the TenLabs Impact program.
              </p>
              <p className="mt-5">
                Safety is inseparable from innovation. We deploy a multi-layered defense system to prevent, detect,
                enforce, and inform misuse.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-6">
                <h3
                  className="text-2xl md:text-4xl font-medium tracking-tight text-black"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Join us to shape the future of
                  <br />
                  human-technology interaction
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-black/70">
                  We&apos;re always looking for talented and driven minds from diverse backgrounds to join our team.
                </p>
                <Link href="/company/careers">
                  <button className="mt-8 inline-flex h-10 items-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90 transition">
                    See openings
                    <ArrowRight className="ml-2 size-4" />
                  </button>
                </Link>
              </div>
              <div className="md:col-span-6">
                <div className="rounded-[28px] border border-black/10 bg-black/[0.03] overflow-hidden">
                  <div className="p-5 grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-black/10 to-black/0 border border-black/10"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
