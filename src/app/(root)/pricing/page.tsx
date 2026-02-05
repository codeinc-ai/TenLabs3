"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronDown, Check, Minus, Plus, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing";
import { Button } from "@/components/ui/button";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Segment = "all" | "creative" | "agents" | "api";

type Plan = {
  id: string;
  name: string;
  price: string;
  per: string;
  cta: string;
  badge?: string;
  highlight?: "creator" | "business";
  features: string[];
  credits: string;
  segment: Segment;
};

const consumerPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "per month",
    cta: "Build for free",
    features: [
      "Text to Speech",
      "Speech to Text",
      "Music",
      "Agents",
      "3 projects in Studio",
      "Automated Dubbing",
      "API Access",
    ],
    credits: "10k credits per month",
    segment: "all",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$5",
    per: "per month",
    cta: "Choose Starter",
    features: [
      "Everything in Free, plus",
      "Commercial License",
      "Instant Voice Cloning",
      "20 projects in Studio",
      "Dubbing Studio",
      "Music commercial use",
    ],
    credits: "30k credits per month",
    segment: "creative",
  },
  {
    id: "creator",
    name: "Creator",
    price: "$11",
    per: "per month",
    cta: "Choose Creator",
    badge: "Popular",
    highlight: "creator",
    features: [
      "Everything in Starter, plus",
      "Professional Voice Cloning",
      "Additional Credits",
      "192kbps quality audio",
    ],
    credits: "100k credits per month",
    segment: "creative",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    per: "per month",
    cta: "Choose Pro",
    features: [
      "Everything in Creator, plus",
      "44.1kHz PCM audio output via API",
    ],
    credits: "500k credits per month",
    segment: "api",
  },
];

const businessPlans: Plan[] = [
  {
    id: "scale",
    name: "Scale",
    price: "$330",
    per: "per month",
    cta: "Choose Scale",
    features: ["Everything in Pro, plus", "3 Workspace seats"],
    credits: "2M credits per month · 3 seats",
    segment: "agents",
  },
  {
    id: "business",
    name: "Business",
    price: "$1,320",
    per: "per month",
    cta: "Choose Business",
    highlight: "business",
    features: ["Everything in Scale, plus", "Low-latency TTS as low as 5ms", "3 Professional Voice Clones", "5 Workspace seats"],
    credits: "11M credits per month · 5 seats",
    segment: "agents",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom pricing",
    per: "",
    cta: "Contact us",
    features: [
      "Everything in Business, plus",
      "Custom terms & assurance around DPAs/SLAs",
      "BRAs for HIPAA customers",
      "Custom SSO",
      "More seats and voices",
      "Elevated concurrency limits",
      "Fully managed dubbing",
      "Priority support",
    ],
    credits: "Custom number of credits and seats",
    segment: "all",
  },
];

function SegmentedTabs({ value, onChange }: { value: Segment; onChange: (v: Segment) => void }) {
  const tabs: Array<{ id: Segment; label: string }> = [
    { id: "all", label: "All" },
    { id: "creative", label: "Creative" },
    { id: "agents", label: "Agents" },
    { id: "api", label: "API" },
  ];

  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
      {tabs.map((t) => {
        const on = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "h-8 px-3 rounded-full text-xs transition",
              on ? "bg-white text-black" : "text-white/65 hover:text-white"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function BillingDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const options = ["Monthly billing", "Annual billing"] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition text-xs text-white/70 inline-flex items-center gap-2"
      >
        {value}
        <ChevronDown className={cn("size-4 transition", open ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 12, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-20 mt-2"
          >
            <div className="w-44 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm hover:bg-white/[0.06] transition",
                    o === value ? "text-white" : "text-white/70"
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
            <button className="fixed inset-0 -z-10" aria-hidden onClick={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const highlighted = plan.highlight === "creator" || plan.highlight === "business";
  const hasBg = plan.highlight === "creator" || plan.highlight === "business";

  return (
    <div
      className={cn(
        "relative rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring overflow-hidden h-full",
        highlighted ? "shadow-[0_40px_140px_rgba(0,0,0,0.75)]" : ""
      )}
    >
      {hasBg && (
        <div className="absolute inset-0" aria-hidden>
          <div
            className="h-full w-full"
            style={{
              background: plan.highlight === "creator"
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)"
                : "linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(239, 68, 68, 0.2) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="text-lg font-semibold tracking-tight text-white"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              {plan.name}
            </div>
            {plan.badge && (
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[11px] text-white/80">
                  {plan.badge}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm text-white/65">
            <span
              className="text-2xl font-semibold tracking-tight text-white"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              {plan.price}
            </span>{" "}
            {plan.per && <span className="text-white/55">{plan.per}</span>}
          </div>
        </div>

        <div className="mt-5">
          <SignedOut>
            <Link href="/sign-up">
              <button
                className={cn(
                  "h-10 w-full rounded-full text-sm font-medium transition",
                  "bg-white text-black hover:bg-white/90"
                )}
              >
                {plan.cta}
              </button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button
                className={cn(
                  "h-10 w-full rounded-full text-sm font-medium transition",
                  "bg-white text-black hover:bg-white/90"
                )}
              >
                {plan.cta}
              </button>
            </Link>
          </SignedIn>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="border-t border-white/10 pt-5" />
        <div className="grid gap-3">
          {plan.features.map((f, idx) => (
            <div key={f + idx} className="flex items-start gap-2 text-sm text-white/70">
              <Check className="mt-0.5 size-4 text-white/55" strokeWidth={2} />
              <div>{f}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-white/55">{plan.credits}</div>
      </div>
    </div>
  );
}

type FAQ = { q: string; a: string };

const faqs: FAQ[] = [
  {
    q: "What is usage-based billing?",
    a: "Plans include monthly credits. If you exceed them, additional usage is billed at the plan's overage rate.",
  },
  {
    q: "How do text characters and credits work?",
    a: "Credits are a unified unit across features. Text to Speech and other tools deduct credits based on processing and output.",
  },
  {
    q: "When do my credits reset, and do unused credits roll over?",
    a: "Credits reset monthly. Unused credits do not roll over unless otherwise specified in an enterprise agreement.",
  },
  {
    q: "Is there a limit on how many credits I can use in a single request?",
    a: "We apply reasonable limits to protect system stability. Enterprise plans can request higher limits.",
  },
  {
    q: "Am I charged for every generation?",
    a: "Billing is based on successful usage. Failed requests that do not produce output are not intended to consume credits.",
  },
  {
    q: "What happens if I upgrade, downgrade, or cancel my subscription?",
    a: "Changes take effect immediately and any prorations are handled automatically based on your billing plan.",
  },
  {
    q: "When can I cancel my subscription?",
    a: "You can cancel any time from your account settings. Access continues until the end of the billing period.",
  },
  {
    q: "How do I check how many credits I have remaining?",
    a: "Your dashboard shows remaining credits and usage breakdown by feature.",
  },
];

export default function PricingPage() {
  const [segment, setSegment] = useState<Segment>("all");
  const [billing, setBilling] = useState("Monthly billing");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const topPlans = useMemo(() => {
    if (segment === "all") return consumerPlans;
    return consumerPlans.filter((p) => p.segment === "all" || p.segment === segment);
  }, [segment]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} aria-hidden />
          <div className="absolute inset-0 tenlabs-grid opacity-[0.14] hidden md:block" aria-hidden />

          <div className="relative mx-auto max-w-6xl px-4 pt-24 md:pt-28 pb-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Reveal>
                  <h1
                    className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    Flexible pricing for your
                    <br />
                    needs
                  </h1>
                </Reveal>
              </div>

              <Reveal delay={0.06}>
                <div className="flex items-center gap-3">
                  <SegmentedTabs value={segment} onChange={setSegment} />
                  <BillingDropdown value={billing} onChange={setBilling} />
                </div>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {topPlans.map((p) => (
                <Reveal key={p.id} delay={p.id === "creator" ? 0.08 : 0.02}>
                  <PlanCard plan={p} />
                </Reveal>
              ))}
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-[1.15fr_2.85fr]">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.02] tenlabs-ring p-6">
                <div
                  className="text-2xl md:text-4xl font-semibold tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  For
                  <br />
                  Businesses
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {businessPlans.map((p, i) => (
                  <Reveal key={p.id} delay={0.04 * i}>
                    <PlanCard plan={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Startup Grants Section */}
        <section className="relative py-14 md:py-20">
          <div className="absolute inset-0" style={{ background: "#070707" }} aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring overflow-hidden">
              <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <div className="p-8 md:p-10">
                  <div
                    className="text-lg font-medium text-white"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    Startup Grants Program
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Build intelligent, real-time conversational audio agents into your new product or startup for free with a TenLabs Grant.
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-6 max-w-sm">
                    <div>
                      <div className="text-sm font-medium text-white">12 Months free</div>
                      <div className="mt-1 text-xs text-white/50">To build, launch & test</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">33M Characters</div>
                      <div className="mt-1 text-xs text-white/50">Valid for 12 months</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button variant="secondary" className="bg-white/5 hover:bg-white/10 border border-white/12 text-white/80">
                      Learn more
                    </Button>
                  </div>
                </div>

                <div className="p-6 md:p-10">
                  <div className="rounded-[24px] border border-white/10 bg-black/30 overflow-hidden">
                    <img
                      src="/images/landing/pricing-grants-illustration.png"
                      alt=""
                      className="w-full h-[260px] md:h-[320px] object-cover opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-14 md:py-20">
          <div className="absolute inset-0" style={{ background: "#070707" }} aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <h2
                className="text-3xl md:text-5xl font-medium tracking-tight"
                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
              >
                Frequently asked questions
              </h2>
            </Reveal>

            <div className="mt-10 rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden tenlabs-ring">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className="border-b border-white/10 last:border-b-0">
                    <button
                      onClick={() => setOpenFaq((v) => (v === i ? null : i))}
                      className="w-full px-6 py-5 flex items-center justify-between gap-6 text-left hover:bg-white/[0.03] transition"
                    >
                      <div className="text-sm md:text-base text-white/85">{f.q}</div>
                      <div className="size-9 rounded-full border border-white/10 bg-white/[0.03] grid place-items-center text-white/70">
                        {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="px-6 pb-5"
                        >
                          <div className="text-sm text-white/60 leading-7">{f.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="relative py-14 md:py-20">
          <div className="absolute inset-0" style={{ background: "#050505" }} aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
              <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div
                    className="text-2xl md:text-4xl font-semibold tracking-tight"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    Create with the highest quality AI Audio
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/company/about">
                    <Button variant="secondary" className="bg-white/5 hover:bg-white/10 border border-white/12 text-white/85">
                      Contact Sales
                    </Button>
                  </Link>
                  <SignedOut>
                    <Link href="/sign-up">
                      <Button className="bg-white text-black hover:bg-white/90">
                        Sign up
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button className="bg-white text-black hover:bg-white/90">
                        Dashboard
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
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
