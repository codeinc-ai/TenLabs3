"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { ArrowRight, Phone, Calendar, BookOpen, ShoppingCart, Globe, Code, Cpu, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/landing";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AgentsPlatformPage() {
  const useCases = [
    {
      icon: <Phone className="size-5" />,
      title: "Customer Support",
      desc: "Deploy AI agents that handle customer inquiries 24/7 with natural, human-like conversations.",
    },
    {
      icon: <Calendar className="size-5" />,
      title: "Scheduling",
      desc: "Automate appointment booking and calendar management with voice-based agents.",
    },
    {
      icon: <BookOpen className="size-5" />,
      title: "Learning",
      desc: "Create interactive educational experiences with AI tutors that adapt to each learner.",
    },
    {
      icon: <ShoppingCart className="size-5" />,
      title: "E-commerce",
      desc: "Guide customers through product discovery and purchases with conversational AI.",
    },
  ];

  const features = [
    {
      icon: <Mic className="size-5" />,
      title: "Natural Voice",
      desc: "Ultra-realistic voice synthesis that sounds human, not robotic.",
    },
    {
      icon: <Globe className="size-5" />,
      title: "Multi-language",
      desc: "Support for 30+ languages with native-quality pronunciation.",
    },
    {
      icon: <Cpu className="size-5" />,
      title: "Low Latency",
      desc: "Sub-250ms response times for natural conversational flow.",
    },
    {
      icon: <Code className="size-5" />,
      title: "Easy Integration",
      desc: "Simple APIs and SDKs for any platform or framework.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} aria-hidden />
          <div className="absolute inset-0 tenlabs-grid opacity-[0.14] hidden md:block" aria-hidden />
          <div
            className="absolute -top-56 left-1/2 h-[640px] w-[820px] -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), rgba(255,255,255,0.00) 65%)",
              filter: "blur(10px)",
            }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-24 md:pt-32 pb-16">
            <div className="max-w-3xl mx-auto text-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  <Cpu className="size-3.5" />
                  <span>AI Voice Agents</span>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1
                  className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Build intelligent voice agents that feel human
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-5 text-base md:text-lg text-white/65">
                  Create conversational AI experiences with natural voice, low latency, and seamless integrations.
                  Deploy agents that understand, respond, and adapt in real-time.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <Button className="h-11 bg-white text-black hover:bg-white/90">
                        Start building
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button className="h-11 bg-white text-black hover:bg-white/90">
                        Go to Dashboard
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  </SignedIn>
                  <Link href="/pricing">
                    <Button variant="secondary" className="h-11 bg-white/5 hover:bg-white/10 border border-white/10">
                      View pricing
                    </Button>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Hero Visual */}
            <Reveal delay={0.2}>
              <div className="mt-12 relative">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <img
                    src="/images/landing/agents-hero-phone.png"
                    alt="Agents Platform"
                    className="w-full h-[300px] md:h-[400px] object-cover opacity-80"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="relative py-16 md:py-22">
          <div className="absolute inset-0" style={{ background: "#0a0a0a" }} aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="text-center">
                <div className="text-xs text-white/45">Use Cases</div>
                <h2
                  className="mt-4 text-3xl md:text-5xl font-medium tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Deploy agents for any scenario
                </h2>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {useCases.map((item, i) => (
                <Reveal key={item.title} delay={0.05 * i}>
                  <Card className="h-full border-white/10 bg-white/[0.03] hover:bg-white/[0.045] transition tenlabs-ring">
                    <div className="p-6">
                      <div className="size-11 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white">
                        {item.icon}
                      </div>
                      <div
                        className="mt-4 text-lg font-semibold text-white"
                        style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                      >
                        {item.title}
                      </div>
                      <div className="mt-2 text-sm text-white/65">{item.desc}</div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-16 md:py-22">
          <div className="absolute inset-0 bg-black" aria-hidden />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 55%)" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="text-center">
                <div className="text-xs text-white/45">Platform Features</div>
                <h2
                  className="mt-4 text-3xl md:text-5xl font-medium tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Built for production
                </h2>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((item, i) => (
                <Reveal key={item.title} delay={0.05 * i}>
                  <Card className="h-full border-white/10 bg-white/[0.03] hover:bg-white/[0.045] transition tenlabs-ring">
                    <div className="p-6">
                      <div className="size-11 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white">
                        {item.icon}
                      </div>
                      <div
                        className="mt-4 text-lg font-semibold text-white"
                        style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                      >
                        {item.title}
                      </div>
                      <div className="mt-2 text-sm text-white/65">{item.desc}</div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 md:py-22">
          <div className="absolute inset-0" style={{ background: "#050505" }} aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <div
                      className="text-2xl md:text-4xl font-semibold tracking-tight"
                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                    >
                      Ready to build your first agent?
                    </div>
                    <div className="mt-2 text-sm text-white/65">
                      Get started for free with 10k credits per month.
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <Button className="bg-white text-black hover:bg-white/90">
                          Start free
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard">
                        <Button className="bg-white text-black hover:bg-white/90">
                          Go to Dashboard
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    </SignedIn>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
