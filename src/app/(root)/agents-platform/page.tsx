"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, Play } from "lucide-react";
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
          <Link href="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl tenlabs-glass tenlabs-ring grid place-items-center">
              <AudioLines className="size-4 text-white" strokeWidth={1.8} />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#use-cases" className="hover:text-white transition">Use cases</a>
            <a href="#multimodal" className="hover:text-white transition">Multimodal</a>
            <a href="#workflows" className="hover:text-white transition">Workflows</a>
            <a href="#customize" className="hover:text-white transition">Customize</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button variant="secondary" className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4">Talk to Sales</Button>
            </Link>
            <SignedOut>
              <Link href="/sign-up">
                <Button className="h-9 rounded-full bg-white text-black hover:bg-white/90 px-4">Create an AI Agent</Button>
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

const useCases = [
  { id: "support", title: "Customer Support", desc: "Always-on, empathetic voice agents that resolve issues instantly, reduce wait times, and boost satisfaction.", img: "/images/landing/agents-usecase-support.png" },
  { id: "scheduling", title: "Inbound Scheduling", desc: "Automated through voice agents that coordinate calendars and handle booking requests with ease.", img: "/images/landing/agents-usecase-scheduling.png" },
  { id: "learning", title: "Learning & Development", desc: "Powered by voice-driven roleplay agents that simulate real-world scenarios and build employee skills.", img: "/images/landing/agents-usecase-learning.png" },
  { id: "ecommerce", title: "Ecommerce", desc: "Enhanced with voice agents that guide customers through purchases, answer questions, and personalize shopping.", img: "/images/landing/agents-usecase-ecommerce.png" },
];

export default function AgentsPlatformPage() {
  const [active, setActive] = useState<"conversational" | "tools" | "deploy">("conversational");

  const tabs = [
    { id: "conversational" as const, label: "Conversational agents that speak, read, and see", body: "Multimodal by design, TenLabs Agents understand spoken or written inputs, retrieve the right answers, and respond naturally in real time. Agents listen, read, and interact just like a human would — across voice and chat." },
    { id: "tools" as const, label: "Take action with external tool calls", body: "Connect tools and workflows so agents can update systems, trigger actions, and complete tasks — with strict guardrails and logging across every step." },
    { id: "deploy" as const, label: "Deploy anywhere your customers are", body: "Launch agents on web, mobile, or your contact center. Keep latency low with region-aware routing and enterprise-grade reliability." },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <MiniHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/landing/agents-hero-bg.png" alt="" fill className="object-cover opacity-70" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(900px 480px at 50% 0%, rgba(255,255,255,0.10), rgba(0,0,0,0) 60%), linear-gradient(180deg, #000 0%, #070707 60%, #000 100%)" }} />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 pt-10 md:pt-14 pb-14">
            <div className="grid items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
              <div>
                <Reveal>
                  <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    The conversational
                    <br />
                    agents platform
                  </h1>
                </Reveal>
                <Reveal delay={0.06}>
                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/65">
                    Deploy natural, human-sounding agents in 32 languages with leading accuracy and ultra low latency
                    in voice or chat. Connected to your knowledge base and tools, our agents handle complex workflows
                    to deliver faster resolutions with enterprise-grade reliability and control.
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <Link href="/pricing">
                      <Button className="h-11 px-5 rounded-full bg-white text-black hover:bg-white/90">Talk to Sales</Button>
                    </Link>
                    <SignedOut>
                      <Link href="/sign-up">
                        <Button variant="secondary" className="h-11 px-5 rounded-full border border-white/12 bg-white/5 hover:bg-white/10">Create an AI Agent</Button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard">
                        <Button variant="secondary" className="h-11 px-5 rounded-full border border-white/12 bg-white/5 hover:bg-white/10">Create an AI Agent</Button>
                      </Link>
                    </SignedIn>
                  </div>
                </Reveal>
                <div className="mt-10 flex flex-wrap items-center gap-8 opacity-70">
                  {["deliveroo", "Revolut", "Cisco", "T", "Salesforce", "meesho"].map((x) => (
                    <div key={x} className="text-xs tracking-[0.22em] uppercase text-white/55">{x}</div>
                  ))}
                </div>
              </div>
              <Reveal delay={0.08}>
                <div className="relative">
                  <div className="mx-auto w-full max-w-[420px] rounded-[34px] border border-white/10 bg-white/[0.04] tenlabs-ring tenlabs-glass overflow-hidden shadow-[0_40px_140px_rgba(0,0,0,0.75)]">
                    <div className="p-3">
                      <Image src="/images/landing/agents-hero-phone.png" alt="Agent" width={400} height={600} className="w-full h-auto rounded-[26px]" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-3 py-1.5 text-xs text-white/75 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Talk to an agent
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="use-cases" className="relative py-14 md:py-20">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((c, idx) => (
                <Reveal key={c.id} delay={0.03 * idx}>
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden tenlabs-ring">
                    <div className="h-[220px] bg-black/30 relative">
                      <Image src={c.img} alt="" fill className="object-cover" />
                    </div>
                    <div className="p-5">
                      <div className="text-sm font-medium text-white">{c.title}</div>
                      <div className="mt-2 text-sm text-white/60 leading-6">{c.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="multimodal" className="relative py-14 md:py-20">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="text-xs text-white/45">Multimodal Agents</div>
                <h2 className="mt-4 text-3xl md:text-5xl font-medium tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                  TenLabs Agents resolve issues,
                  <br />
                  deliver answers, and take action —
                  <br />
                  anytime, anywhere
                </h2>
                <div className="mt-10 grid gap-2">
                  {tabs.map((t) => {
                    const on = t.id === active;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActive(t.id)}
                        className={cn(
                          "w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition",
                          on ? "bg-white/[0.05]" : "opacity-70 hover:opacity-100 hover:bg-white/[0.04]",
                        )}
                      >
                        <div className="text-sm text-white/85">{t.label}</div>
                        {on ? <div className="mt-2 text-sm text-white/60 leading-6">{t.body}</div> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden">
                  <Image src="/images/landing/agents-wave-panel.png" alt="Wave panel" width={600} height={400} className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="customize" className="relative py-14 md:py-20">
          <div className="absolute inset-0" style={{ background: "#070707" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-3xl md:text-[40px] font-medium tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                Customize your agents
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Reveal delay={0.05}>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="text-sm font-medium text-white">Knowledge base</div>
                    <div className="mt-2 text-xs text-white/55">Connect documents, FAQs, and URLs. Agents provide accurate answers grounded in your content.</div>
                  </div>
                  <div className="relative h-40">
                    <Image src="/images/landing/agents-knowledgebase.png" alt="Knowledge base" fill className="object-cover" />
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="text-sm font-medium text-white">Custom voices</div>
                    <div className="mt-2 text-xs text-white/55">Create distinctive brand presence with voices that match your tone.</div>
                  </div>
                  <div className="relative h-40">
                    <Image src="/images/landing/agents-wave-panel.png" alt="Wave panel" fill className="object-cover" />
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.11}>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
                  <div className="p-6">
                    <div className="text-sm font-medium text-white">Integrations</div>
                    <div className="mt-2 text-xs text-white/55">Connect to CRMs, ticketing, scheduling, and internal systems.</div>
                  </div>
                  <div className="relative h-40">
                    <Image src="/images/landing/agents-workflows.png" alt="Workflows" fill className="object-cover" />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="text-2xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    Ready to create AI agents?
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Deploy natural voice agents that resolve issues and take action.
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button className="bg-white text-black hover:bg-white/90">Create an AI Agent</Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button className="bg-white text-black hover:bg-white/90">Open Dashboard</Button>
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
