"use client";

import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowRight, Search, ArrowUpRight } from "lucide-react";
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

const chips = [
  "Featured",
  "API Platform Stories",
  "Affiliates",
  "Agents Platform Stories",
  "Company",
  "Creative Platform Stories",
  "Customer Stories",
  "Developer",
  "Impact",
  "Product",
  "Research",
] as const;

type Chip = (typeof chips)[number];

type Post = {
  id: string;
  chip: Chip;
  title: string;
  desc: string;
  author: string;
  date: string;
  featured?: boolean;
};

const posts: Post[] = [
  {
    id: "series-d",
    chip: "Company",
    title: "TenLabs raises $500M Series D at $11B valuation",
    desc: "Transforming how we interact with technology",
    author: "Team TenLabs",
    date: "Feb 2, 2026",
    featured: true,
  },
  {
    id: "v3-ga",
    chip: "Research",
    title: "Ten v3 is Now Generally Available",
    desc: "Ten v3 is now out of Alpha.",
    author: "Joe Reeve",
    date: "Feb 2, 2026",
  },
  {
    id: "revolut",
    chip: "Agents Platform Stories",
    title: "Revolut selects TenAgents to bolster customer support",
    desc: "Voice agents at scale with privacy-first workflows",
    author: "Stan Messuares",
    date: "Jan 29, 2026",
  },
  {
    id: "grid",
    chip: "Company",
    title: "We are on the grid",
    desc: "TenLabs is an official partner of a global team",
    author: "Carles Reina",
    date: "Jan 29, 2026",
  },
  {
    id: "masterclass",
    chip: "API Platform Stories",
    title: "MasterClass brings AI instructors to life",
    desc: "75% of users prefer voice interactions",
    author: "Fergal Burnett",
    date: "Jan 5, 2026",
  },
  {
    id: "liberty",
    chip: "Agents Platform Stories",
    title: "We're partnering with Liberty Global to accelerate voice AI",
    desc: "Expansion across regions",
    author: "Carles Reina",
    date: "Nov 21, 2025",
  },
  {
    id: "image-video",
    chip: "Product",
    title: "Introducing TenLabs Image & Video",
    desc: "Bring ideas to life in one creative suite",
    author: "Team TenLabs",
    date: "Dec 1, 2025",
  },
  {
    id: "toyota",
    chip: "Agents Platform Stories",
    title: "Toyota engages fans with AI-powered experience",
    desc: "Driving deeper engagement",
    author: "Team TenLabs",
    date: "Dec 1, 2025",
  },
];

export default function BlogPage() {
  const [active, setActive] = useState<Chip>("Featured");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = [...posts];
    if (active !== "Featured") list = list.filter((p) => p.chip === active);
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((p) => (p.title + " " + p.desc).toLowerCase().includes(qq));
    }
    return list;
  }, [active, q]);

  const hero = posts.find((p) => p.featured) ?? posts[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar label="Blog" />

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
          <div className="relative mx-auto max-w-6xl px-4 pt-14 md:pt-20 pb-8">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <h1
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  {hero.title}
                </h1>
                <p className="mt-3 text-sm text-white/60">{hero.desc}</p>
                <Link
                  href={`/company/blog/${hero.id}`}
                  className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-white/90 transition"
                >
                  Read article
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
                <div className="relative h-[240px] md:h-[320px] bg-gradient-to-br from-white/10 to-white/0 grid place-items-center">
                  <div className="text-2xl font-semibold text-white/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                    {hero.chip}
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
                      {hero.chip}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => {
                  const on = c === active;
                  return (
                    <button
                      key={c}
                      onClick={() => setActive(c)}
                      className={cn(
                        "h-9 px-3 rounded-full text-xs border transition",
                        on
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/45" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  className="h-11 w-full rounded-full border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white/85 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="relative py-10">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.slice(0, 2).map((p) => (
                <Link key={p.id} href={`/company/blog/${p.id}`}>
                  <div className="group rounded-[26px] border border-black/10 bg-[#f5f3ef] overflow-hidden shadow-[0_14px_70px_rgba(0,0,0,0.10)]">
                    <div className="relative h-[220px] bg-gradient-to-br from-black/5 to-black/0 grid place-items-center">
                      <div className="text-2xl font-semibold text-black/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        {p.chip}
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-black/70">
                          {p.chip}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 size-9 rounded-full bg-white/85 border border-black/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                        <ArrowUpRight className="size-4 text-black/70" />
                      </div>
                    </div>
                    <div className="p-5">
                      <div
                        className="text-base font-medium tracking-tight text-black"
                        style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                      >
                        {p.title}
                      </div>
                      <div className="mt-2 text-sm text-black/60">{p.desc}</div>
                      <div className="mt-4 flex items-center gap-3 text-xs text-black/45">
                        <span>{p.date}</span>
                        <span className="size-1 rounded-full bg-black/20" />
                        <span>{p.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(2).map((p) => (
                <Link key={p.id} href={`/company/blog/${p.id}`}>
                  <div className="group rounded-[26px] border border-black/10 bg-[#f5f3ef] overflow-hidden shadow-[0_14px_70px_rgba(0,0,0,0.10)]">
                    <div className="relative h-[180px] bg-gradient-to-br from-black/5 to-black/0 grid place-items-center">
                      <div className="text-xl font-semibold text-black/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        {p.title.split(" ")[0]}
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-black/70">
                          {p.chip}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 size-9 rounded-full bg-white/85 border border-black/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                        <ArrowUpRight className="size-4 text-black/70" />
                      </div>
                    </div>
                    <div className="p-5">
                      <div
                        className="text-base font-medium tracking-tight text-black"
                        style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                      >
                        {p.title}
                      </div>
                      <div className="mt-2 text-sm text-black/60">{p.desc}</div>
                      <div className="mt-4 flex items-center gap-3 text-xs text-black/45">
                        <span>{p.date}</span>
                        <span className="size-1 rounded-full bg-black/20" />
                        <span>{p.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
