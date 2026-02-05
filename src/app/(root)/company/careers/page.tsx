"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ChevronDown } from "lucide-react";
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
              <Link href="/sign-up">
                <button className="h-9 px-4 rounded-full bg-white text-black hover:bg-white/90 transition">
                  Sign up
                </button>
              </Link>
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

type Job = {
  team: string;
  title: string;
  tags: string[];
};

const jobs: Job[] = [
  { team: "Engineering & Product", title: "AI Safety Policy & Operations", tags: ["Remote", "United Kingdom", "+2 more"] },
  { team: "Engineering & Product", title: "Android Engineer", tags: ["Remote", "London", "+8 more"] },
  { team: "Engineering & Product", title: "Application Security Engineer", tags: ["Remote", "United Kingdom", "+2 more"] },
  { team: "Engineering & Product", title: "Audiobook Specialists (Freelance)", tags: ["Remote", "United Kingdom", "+7 more"] },
  { team: "Engineering & Product", title: "Automations Engineer", tags: ["Remote", "United States", "+11 more"] },
  { team: "Engineering & Product", title: "Deployment Strategist", tags: ["Remote", "United States", "+6 more"] },
  { team: "Engineering & Product", title: "Design Engineer", tags: ["Remote", "United Kingdom", "+2 more"] },
  { team: "Engineering & Product", title: "Dubbing Specialist (Freelance)", tags: ["Remote", "United Kingdom", "+7 more"] },
  { team: "Engineering & Product", title: "Enterprise Solutions Engineer", tags: ["Remote", "United States", "+1 more"] },
];

export default function CareersPage() {
  const [deptOpen, setDeptOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar label="Careers" />

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
          <div className="relative mx-auto max-w-6xl px-4 pt-14 md:pt-20 pb-10">
            <Reveal>
              <h1
                className="text-4xl md:text-6xl font-semibold tracking-tight"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Pioneer the future of
                <br />
                Audio AI
              </h1>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/65">
                Join us in shaping the future of voice technology and AI
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-7">
                <a
                  href="#openings"
                  className="h-10 inline-flex items-center rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-white/90 transition"
                >
                  Open positions
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-10 rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.03] tenlabs-ring">
                <div className="h-[280px] sm:h-[440px] w-full bg-gradient-to-br from-white/10 to-white/0 grid place-items-center">
                  <div className="text-2xl font-semibold text-white/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Team Photo
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2
                className="text-3xl md:text-5xl font-medium tracking-tight text-black"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Who we are
              </h2>
            </Reveal>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-black/70">
              We are a global team of passionate and innovative individuals united by curiosity and a shared goal: to
              be the first choice for AI audio solutions. Together, we solve challenges and create tools that change how
              people work with sound.
            </p>

            <div className="mt-10">
              <div className="grid gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-[22px] overflow-hidden border border-black/10 bg-black/[0.03]"
                  >
                    <div className="h-full w-full bg-gradient-to-br from-black/10 to-black/0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center text-xs tracking-[0.22em] uppercase text-black/35">
              Our team has learned their craft in various startups and high-growth environments.
            </div>
          </div>
        </section>

        {/* What Sets Us Apart Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2
                className="text-3xl md:text-5xl font-medium tracking-tight text-white"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                What sets us apart
              </h2>
            </Reveal>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/60">
              We make sure our team has what they need to innovate quickly and responsibly. We go the extra mile for
              both our work and our people.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { t: "Pioneering AI audio", d: "We're in it for the long haul, focused on building a generational company." },
                { t: "Caring deeply", d: "We set the bar high. We take pride in doing things right." },
                { t: "High ownership", d: "We work with autonomy and accountability. The best idea wins." },
              ].map((c, i) => (
                <div
                  key={c.t}
                  className="rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden"
                >
                  <div className="h-44 bg-gradient-to-br from-white/10 to-white/0" />
                  <div className="p-6">
                    <div
                      className="text-base font-medium text-white"
                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                    >
                      {c.t}
                    </div>
                    <div className="mt-2 text-sm text-white/60">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2
                className="text-center text-3xl md:text-5xl font-medium tracking-tight text-white"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                What we offer
              </h2>
            </Reveal>
            <p className="mt-4 text-center text-[15px] leading-7 text-white/60">
              Here is what you can expect when you join TenLabs.
            </p>

            <div className="mt-10 rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-2xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10"
                    />
                  ))}
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {[
                    {
                      t: "A truly global team",
                      d: "Our team spans many countries with hubs in key cities, fostering a rich blend of cultural perspectives.",
                    },
                    {
                      t: "High velocity innovation",
                      d: "We embrace rapid experimentation and lean team structures, empowering individuals to make meaningful decisions.",
                    },
                  ].map((p, i) => (
                    <div key={p.t} className="flex gap-4">
                      <div className="size-11 rounded-xl bg-white/5 border border-white/10" />
                      <div>
                        <div className="text-sm font-medium text-white">{p.t}</div>
                        <div className="mt-1 text-sm text-white/60">{p.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Openings Section */}
        <section id="openings" className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2
                className="text-4xl md:text-6xl font-semibold tracking-tight text-black"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Join our mission
              </h2>
            </Reveal>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-black/70">
              We&apos;re looking for exceptional individuals who combine technical excellence with ethical awareness,
              who are excited by hard problems and motivated by human impact.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <div className="relative">
                <button
                  onClick={() => setDeptOpen((v) => !v)}
                  className="h-10 px-4 rounded-full border border-black/10 bg-white text-sm text-black/70 hover:text-black transition inline-flex items-center gap-2"
                >
                  All departments
                  <ChevronDown className={cn("size-4 transition", deptOpen ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {deptOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 12, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full z-20 mt-2"
                    >
                      <div className="w-64 rounded-2xl border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.15)] overflow-hidden">
                        {["Engineering & Product", "Go-to-market", "Operations"].map((x) => (
                          <button
                            key={x}
                            className="w-full text-left px-4 py-2.5 text-sm text-black/70 hover:bg-black/[0.03] transition"
                          >
                            {x}
                          </button>
                        ))}
                      </div>
                      <button
                        className="fixed inset-0 -z-10"
                        onClick={() => setDeptOpen(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setLocOpen((v) => !v)}
                  className="h-10 px-4 rounded-full border border-black/10 bg-white text-sm text-black/70 hover:text-black transition inline-flex items-center gap-2"
                >
                  All locations
                  <ChevronDown className={cn("size-4 transition", locOpen ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {locOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 12, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full z-20 mt-2"
                    >
                      <div className="w-64 rounded-2xl border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.15)] overflow-hidden">
                        {["Remote", "London", "New York", "Warsaw"].map((x) => (
                          <button
                            key={x}
                            className="w-full text-left px-4 py-2.5 text-sm text-black/70 hover:bg-black/[0.03] transition"
                          >
                            {x}
                          </button>
                        ))}
                      </div>
                      <button
                        className="fixed inset-0 -z-10"
                        onClick={() => setLocOpen(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="h-10 px-4 rounded-full border border-black/10 bg-white text-sm text-black/70 hover:text-black transition">
                Clear filters
              </button>
            </div>

            <div className="mt-12">
              <div
                className="text-lg font-medium text-black"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Engineering & Product
              </div>
              <div className="mt-5 border-t border-black/10" />

              <div className="mt-2">
                {jobs.map((j, idx) => (
                  <div
                    key={j.title}
                    className="flex items-center justify-between gap-6 py-4 border-b border-black/10"
                  >
                    <div className="text-sm md:text-base text-black/85">{j.title}</div>
                    <div className="hidden md:flex items-center gap-2">
                      {j.tags.map((t) => (
                        <span
                          key={t}
                          className="h-7 px-2.5 inline-flex items-center rounded-full border border-black/10 bg-white text-xs text-black/60"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="ml-1 text-black/35">›</span>
                    </div>
                    <div className="md:hidden text-xs text-black/50">{j.tags.slice(0, 2).join(" • ")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
