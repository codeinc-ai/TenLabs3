"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing";

interface ProductHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta?: string;
  image?: string;
  gradient?: string;
}

interface Feature {
  title: string;
  desc: string;
  icon?: React.ReactNode;
}

interface FAQ {
  q: string;
  a: string;
}

interface ProductPageProps {
  hero: ProductHero;
  features?: Feature[];
  bentoCards?: Feature[];
  faq?: FAQ[];
  children?: React.ReactNode;
}

function MiniHeader({ tagline }: { tagline: string }) {
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
              <div className="text-[11px] text-white/50">{tagline}</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="secondary" className="hidden sm:inline-flex h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4">
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="hidden sm:inline-flex h-9 rounded-full bg-white text-black hover:bg-white/90 px-4">
                  Sign up
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90 px-4">
                  Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ hero }: { hero: ProductHero }) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/70">
                <span className="size-1.5 rounded-full bg-white/50" />
                <span>{hero.eyebrow}</span>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1
                className="mt-5 text-balance text-[44px] leading-[1.02] tracking-[-0.035em] font-medium whitespace-pre-line"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                {hero.title}
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6 flex flex-wrap gap-3">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">
                      {hero.primaryCta}
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="h-10 rounded-full bg-white text-black hover:bg-white/90">
                      Open Dashboard
                    </Button>
                  </Link>
                </SignedIn>
                {hero.secondaryCta && (
                  <Link href="/pricing">
                    <Button variant="secondary" className="h-10 rounded-full bg-white/5 text-white hover:bg-white/10 border border-white/10">
                      {hero.secondaryCta}
                    </Button>
                  </Link>
                )}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <Reveal delay={0.15}>
              <p className="text-[13px] leading-5 text-white/65 max-w-sm">
                {hero.subtitle}
              </p>
            </Reveal>
          </div>
        </div>

        {hero.image && (
          <Reveal delay={0.2}>
            <div className="mt-10">
              <div 
                className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden"
                style={hero.gradient ? { background: hero.gradient } : undefined}
              >
                <div className="p-6 sm:p-8">
                  <div className="rounded-[22px] border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden relative aspect-video">
                    <Image
                      src={hero.image}
                      alt={hero.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Features({ features, title, subtitle }: { features: Feature[]; title?: string; subtitle?: string }) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        {title && (
          <Reveal>
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-4 text-sm text-white/60 max-w-xl mx-auto">{subtitle}</p>
              )}
            </div>
          </Reveal>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={0.05 * i}>
              <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass p-6">
                {feature.icon && (
                  <div className="size-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80 mb-4">
                    {feature.icon}
                  </div>
                )}
                <div className="text-sm font-medium text-white">{feature.title}</div>
                <div className="mt-2 text-sm text-white/65">{feature.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoGrid({ cards }: { cards: Feature[] }) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <div className="grid gap-4 md:grid-cols-12">
          {cards.slice(0, 2).map((card, i) => (
            <Reveal key={card.title} delay={0.05 * i} className={i === 0 ? "md:col-span-7" : "md:col-span-5"}>
              <div className="h-full rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-6">
                  <div className="text-sm font-medium text-white">{card.title}</div>
                  <div className="mt-2 text-sm text-white/65">{card.desc}</div>
                  <div className="mt-6 h-32 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent" />
                </div>
              </div>
            </Reveal>
          ))}

          {cards.slice(2).map((card, i) => (
            <Reveal key={card.title} delay={0.1 + 0.05 * i} className="md:col-span-4">
              <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
                <div className="p-6">
                  {card.icon && (
                    <div className="size-8 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white/80">
                      {card.icon}
                    </div>
                  )}
                  <div className="mt-4 text-sm font-medium text-white">{card.title}</div>
                  <div className="mt-2 text-sm text-white/65">{card.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ faq }: { faq: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <h2
            className="text-3xl md:text-[40px] leading-[1.05] tracking-[-0.03em] font-medium"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            Frequently asked questions
          </h2>
        </Reveal>

        <div className="mt-8 border-t border-white/10">
          {faq.map((it, idx) => {
            const isOpen = open === idx;
            return (
              <Reveal key={idx} delay={0.05 * idx}>
                <button
                  className="w-full text-left py-5 border-b border-white/10 hover:bg-white/[0.02] transition"
                  onClick={() => setOpen(isOpen ? null : idx)}
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
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
            <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Ready to get started?
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Start building with TenLabs today. Free tier included.
                </div>
              </div>
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Start free
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Open dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function ProductPageLayout({ hero, features, bentoCards, faq, children }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader tagline={hero.eyebrow} />
      <Hero hero={hero} />
      {children}
      {features && features.length > 0 && <Features features={features} />}
      {bentoCards && bentoCards.length > 0 && <BentoGrid cards={bentoCards} />}
      {faq && faq.length > 0 && <FAQSection faq={faq} />}
      <CTASection />
    </div>
  );
}

export { MiniHeader, Hero, Features, BentoGrid, FAQSection, CTASection };
