"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ChevronDown, ArrowUpRight } from "lucide-react";
import { useState, useMemo } from "react";

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

const tabs = [
  { id: "agents", label: "Agents Platform" },
  { id: "creative", label: "Creative Platform" },
  { id: "api", label: "API Platform" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type Story = {
  id: string;
  industry: string;
  brand: string;
  headline: string;
  featured?: boolean;
};

const stories: Story[] = [
  { id: "pairteam", industry: "Healthcare", brand: "PairTeam", headline: "Clinicians reach more patients with multilingual care.", featured: false },
  { id: "revolut", industry: "BFSI", brand: "Revolut", headline: "Realtime agents scale support with consistent quality.", featured: false },
  { id: "telekom", industry: "Telecom", brand: "T", headline: "35% lift in lead capture and 80% faster customer feedback.", featured: false },
  { id: "zcoly", industry: "E-Comm & Retail", brand: "Zcoly", headline: "A voice agent modeled after a racing legend.", featured: false },
  { id: "deliveroo", industry: "Technology", brand: "Deliveroo", headline: "Automation improves rider onboarding and ops insights.", featured: false },
  { id: "tvs", industry: "E-Comm & Retail", brand: "TVS", headline: "35% lift in lead capture and 80% faster customer feedback.", featured: true },
  { id: "gov", industry: "Government", brand: "UA", headline: "Using AI to make public services work for all citizens.", featured: false },
  { id: "boosted", industry: "BFSI", brand: "Boosted", headline: "Agent workflows accelerate customer response times.", featured: false },
  { id: "immobiliare", industry: "E-Comm & Retail", brand: "Immobiliare", headline: "Localized outreach at scale.", featured: false },
  { id: "tralba", industry: "Technology", brand: "tralba", headline: "Conversational agents for staffing and hiring.", featured: false },
];

export default function CustomerStoriesPage() {
  const [active, setActive] = useState<TabId>("agents");
  const [industry, setIndustry] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const industries = useMemo(() => ["all", ...Array.from(new Set(stories.map((s) => s.industry)))], []);

  const filtered = useMemo(() => {
    if (industry === "all") return stories;
    return stories.filter((s) => s.industry === industry);
  }, [industry]);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar label="Customer Stories" />

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
          <div className="relative mx-auto max-w-6xl px-4 pt-14 md:pt-20 pb-12">
            <h1
              className="text-center text-4xl md:text-6xl font-semibold tracking-tight"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              Customer Stories
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-7 text-white/65">
              Discover how the world&apos;s leading teams use TenLabs for better customer experiences and high quality
              content production.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/pricing">
                <button className="h-10 px-4 rounded-full bg-white text-black hover:bg-white/90 transition">
                  Talk to Sales
                </button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-5 gap-6 items-center opacity-70">
              {["Cisco", "T", "Salesforce", "Disney", "Meta"].map((x) => (
                <div key={x} className="text-center text-xs tracking-[0.22em] uppercase text-white/60">
                  {x}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="relative py-12">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex rounded-full border border-black/10 bg-white p-1">
                {tabs.map((t) => {
                  const on = t.id === active;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActive(t.id)}
                      className={cn(
                        "h-9 px-4 rounded-full text-sm transition",
                        on ? "bg-black text-white" : "text-black/60 hover:text-black"
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="h-10 px-4 rounded-full border border-black/10 bg-white text-sm text-black/70 hover:text-black transition inline-flex items-center gap-2"
                >
                  Filter by industry
                  <ChevronDown className={cn("size-4 transition", filterOpen ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 12, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(8px)" }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full z-20 mt-2"
                    >
                      <div className="w-64 rounded-2xl border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.15)] overflow-hidden">
                        {industries.map((x) => (
                          <button
                            key={x}
                            onClick={() => {
                              setIndustry(x);
                              setFilterOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-sm hover:bg-black/[0.03] transition",
                              x === industry ? "text-black font-medium" : "text-black/70"
                            )}
                          >
                            {x === "all" ? "All industries" : x}
                          </button>
                        ))}
                      </div>
                      <button className="fixed inset-0 -z-10" onClick={() => setFilterOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <a
                  key={s.id}
                  href="#"
                  className={cn(
                    "group rounded-[26px] border border-black/10 bg-[#f5f3ef] overflow-hidden shadow-[0_12px_60px_rgba(0,0,0,0.10)] transition",
                    s.featured && "bg-[#eae6df]"
                  )}
                >
                  <div
                    className={cn(
                      "h-[220px] grid place-items-center relative",
                      s.featured && "bg-gradient-to-br from-black/20 to-black/5"
                    )}
                  >
                    <div className="absolute top-4 left-4 text-[11px] text-black/45">{s.industry}</div>
                    <div
                      className={cn(
                        "text-3xl font-semibold tracking-tight text-black",
                        s.featured && "text-white"
                      )}
                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                    >
                      {s.brand}
                    </div>
                    <div className="absolute top-4 right-4 size-9 rounded-full bg-black/5 border border-black/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                      <ArrowUpRight className="size-4 text-black/70" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-black/70">{s.headline}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
