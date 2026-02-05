"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Shield, ArrowRight } from "lucide-react";
import { useState } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
      viewport={{ once: true, margin: "-140px" }}
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

export default function SafetyPage() {
  const [activePrinciple, setActivePrinciple] = useState(0);

  const principles = [
    {
      title: "Safety by Design",
      desc: "We build safety into everything we do — from the ground up. Our models undergo rigorous evaluations before release, and we embed safeguards directly into our products.",
    },
    {
      title: "Traceability & Accountability",
      desc: "We maintain comprehensive audit trails and implement accountability measures to ensure responsible use of our technology.",
    },
    {
      title: "Transparency",
      desc: "We are open about our safety practices, capabilities, and limitations. We believe transparency builds trust.",
    },
    {
      title: "Agility",
      desc: "We continuously adapt our safety measures to address emerging risks and evolving use cases.",
    },
    {
      title: "Collaboration",
      desc: "We work with industry partners, researchers, and policymakers to advance AI safety practices across the ecosystem.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar label="Safety" />

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
          <div className="relative mx-auto max-w-6xl px-4 pt-14 md:pt-18 pb-10">
            <BackToResources />

            <div className="mt-12 grid place-items-center">
              <div className="size-20 rounded-3xl border border-white/10 bg-white/5 grid place-items-center">
                <Shield className="size-10 text-white/70" strokeWidth={1.5} />
              </div>
              <h1
                className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Safety
              </h1>
              <p className="mt-4 max-w-xl text-center text-[15px] leading-7 text-white/65">
                AI audio built to unlock possibilities and positive impact, guided by responsibility and safeguards that
                protect people from misuse.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="relative py-14 md:py-20">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2
                className="text-3xl md:text-5xl font-medium tracking-tight text-black"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Our Safety Mission
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <p className="text-[15px] leading-7 text-black/70">
                At TenLabs, we believe deeply in the immense benefits of AI audio. Our technology is used by millions of
                individuals and thousands of businesses to make content and information accessible, create immersive
                entertainment experiences, and bring voices back for people who have lost the ability to speak.
              </p>
              <p className="text-[15px] leading-7 text-black/70">
                As with all transformational technologies, we recognize that when technology is misused, it can cause
                harm. That&apos;s why we&apos;re committed to protecting against misuse — especially attempts to deceive
                or exploit others. Our safety principles guide our everyday work and are reflected in concrete,
                multi-layered safeguards.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-[22px] border border-black/10 bg-black/[0.02] p-6">
                  <div className="text-[15px] leading-7 text-black/70">
                    &quot;AI safety is inseparable from innovation. Ensuring our systems are developed, deployed, and
                    used safely remains at the core of our strategy.&quot;
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="size-9 rounded-full bg-black/10" />
                    <div>
                      <div className="text-sm font-medium text-black">Team TenLabs</div>
                      <div className="text-xs text-black/50">Safety & Policy</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="relative py-14 md:py-20">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-6">
                <Reveal>
                  <h2
                    className="text-3xl md:text-5xl font-medium tracking-tight text-black"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    Our Safety Principles
                  </h2>
                </Reveal>
                <p className="mt-3 text-[15px] leading-7 text-black/70">
                  Our safety program is guided by the following principles:
                </p>

                <div className="mt-8 space-y-3">
                  {principles.map((p, idx) => (
                    <button
                      key={p.title}
                      onClick={() => setActivePrinciple(idx)}
                      className={cn(
                        "w-full text-left rounded-2xl border border-black/10 bg-black/[0.02] hover:bg-black/[0.04] transition px-4 py-3",
                        idx !== activePrinciple && "opacity-65"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-black/5 border border-black/10 grid place-items-center">
                          <Shield className="size-4 text-black/70" strokeWidth={1.8} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-black">{p.title}</div>
                          {idx === activePrinciple && (
                            <div className="mt-0.5 text-sm text-black/60">{p.desc}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-6">
                <div className="rounded-[26px] border border-black/10 bg-black/[0.02] overflow-hidden">
                  <div className="w-full h-[340px] grid place-items-center p-8">
                    <div className="text-center">
                      <Shield className="mx-auto size-16 text-black/20" strokeWidth={1} />
                      <div className="mt-4 text-lg font-medium text-black/40" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        Safety Diagram
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="relative pb-20">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-px rounded-[22px] overflow-hidden border border-black/10 bg-black/10 md:grid-cols-2">
              {[
                {
                  title: "Safety Partnership Program",
                  desc: "We support leading organizations to develop technical solutions to detect deepfakes in real time.",
                  cta: "Learn More",
                  href: "#",
                },
                {
                  title: "Report Content",
                  desc: "If you find content which raises concerns, and you believe it was created with our tools, please report it here.",
                  cta: "Report Content",
                  href: "#",
                },
                {
                  title: "Prohibited content & uses policy",
                  desc: "Learn about the types of content and activities that are not allowed when using our tools.",
                  cta: "View Policy",
                  href: "#",
                },
                {
                  title: "TenLabs AI Speech Classifier",
                  desc: "Detect whether an audio clip was created using TenLabs.",
                  cta: "Learn More",
                  href: "#",
                },
                {
                  title: "Coalition for Content Provenance",
                  desc: "An open technical standard providing the ability to trace the origin of media.",
                  cta: "Learn More",
                  href: "#",
                },
                {
                  title: "Content Authenticity Initiative",
                  desc: "Promoting the adoption of an open industry standard for content authenticity and provenance.",
                  cta: "Learn More",
                  href: "#",
                },
              ].map((x, i) => (
                <div key={x.title} className="bg-white p-7">
                  <div
                    className="text-lg font-medium tracking-tight text-black"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    {x.title}
                  </div>
                  <div className="mt-2 text-sm text-black/60">{x.desc}</div>
                  <a
                    href={x.href}
                    className="mt-6 inline-flex h-10 items-center rounded-full border border-black/10 bg-white px-4 text-sm text-black/75 hover:bg-black/[0.03] transition"
                  >
                    {x.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
