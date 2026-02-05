"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { BlogImage } from "@/components/blog/BlogImage";
import { AudioLines, ArrowRight, Search, ArrowUpRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { BlogPost, BlogCategory } from "@/types/BlogTypes";

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

const chips: BlogCategory[] = [
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
];

// Mapping of slug to cover image
const coverImages: Record<string, string> = {
  "series-d": "/images/landing/company-blog-hero.png",
  "v3-ga": "/images/landing/company-blog-research.png",
};

// Fallback posts if DB is empty
const fallbackPosts: BlogPost[] = [
  {
    _id: "series-d",
    slug: "series-d",
    category: "Company",
    title: "TenLabs raises $500M Series D at $11B valuation",
    description: "Transforming how we interact with technology",
    content: "",
    author: "Team TenLabs",
    coverImage: "/images/landing/company-blog-hero.png",
    createdAt: "2026-02-02T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
    featured: true,
    published: true,
  },
  {
    _id: "v3-ga",
    slug: "v3-ga",
    category: "Research",
    title: "Ten v3 is Now Generally Available",
    description: "Eleven v3 is now out of Alpha.",
    content: "",
    author: "Joe Reeve",
    coverImage: "/images/landing/company-blog-research.png",
    createdAt: "2026-02-02T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
    featured: false,
    published: true,
  },
  {
    _id: "revolut",
    slug: "revolut",
    category: "Agents Platform Stories",
    title: "Revolut selects TenAgents to bolster customer support",
    description: "Voice agents at scale with privacy-first workflows",
    content: "",
    author: "Stan Messuares",
    createdAt: "2026-01-29T00:00:00.000Z",
    updatedAt: "2026-01-29T00:00:00.000Z",
    featured: false,
    published: true,
  },
  {
    _id: "grid",
    slug: "grid",
    category: "Company",
    title: "We are on the grid",
    description: "TenLabs is an official partner of a global team",
    content: "",
    author: "Carles Reina",
    createdAt: "2026-01-29T00:00:00.000Z",
    updatedAt: "2026-01-29T00:00:00.000Z",
    featured: false,
    published: true,
  },
  {
    _id: "masterclass",
    slug: "masterclass",
    category: "API Platform Stories",
    title: "MasterClass brings AI instructors to life",
    description: "75% of users prefer voice interactions",
    content: "",
    author: "Fergal Burnett",
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    featured: false,
    published: true,
  },
  {
    _id: "liberty",
    slug: "liberty",
    category: "Agents Platform Stories",
    title: "We're partnering with Liberty Global to accelerate voice AI",
    description: "Expansion across regions",
    content: "",
    author: "Carles Reina",
    createdAt: "2025-11-21T00:00:00.000Z",
    updatedAt: "2025-11-21T00:00:00.000Z",
    featured: false,
    published: true,
  },
  {
    _id: "image-video",
    slug: "image-video",
    category: "Product",
    title: "Introducing TenLabs Image & Video",
    description: "Bring ideas to life in one creative suite",
    content: "",
    author: "Team TenLabs",
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
    featured: false,
    published: true,
  },
  {
    _id: "toyota",
    slug: "toyota",
    category: "Agents Platform Stories",
    title: "Toyota engages fans with AI-powered experience",
    description: "Driving deeper engagement",
    content: "",
    author: "Team TenLabs",
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
    featured: false,
    published: true,
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCoverImage(post: BlogPost): string | null {
  if (post.coverImage) return post.coverImage;
  return coverImages[post.slug] || null;
}

export default function BlogPage() {
  const [active, setActive] = useState<BlogCategory>("Featured");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts);
          }
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (active !== "Featured") list = list.filter((p) => p.category === active);
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((p) => (p.title + " " + p.description).toLowerCase().includes(qq));
    }
    return list;
  }, [active, q, posts]);

  const hero = posts.find((p) => p.featured) ?? posts[0];
  const heroCover = hero ? getCoverImage(hero) : null;

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
                  {hero?.title || "Welcome to our Blog"}
                </h1>
                <p className="mt-3 text-sm text-white/60">{hero?.description || "Discover the latest news and stories"}</p>
                {hero && (
                  <Link
                    href={`/company/blog/${hero.slug}`}
                    className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-white/90 transition"
                  >
                    Read article
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                )}
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
                <div className="relative">
                  {heroCover ? (
                    <BlogImage
                      src={heroCover}
                      alt={hero?.title || "Blog"}
                      width={600}
                      height={320}
                      className="h-[240px] md:h-[320px] w-full object-cover"
                    />
                  ) : (
                    <div className="h-[240px] md:h-[320px] bg-gradient-to-br from-white/10 to-white/0 grid place-items-center">
                      <div className="text-2xl font-semibold text-white/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        {hero?.category || "Blog"}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
                      {hero?.category || "Featured"}
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
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/50">Loading posts...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/50">No posts found</div>
              </div>
            ) : (
              <>
                {/* Top 2 Featured Cards */}
                <div className="grid gap-5 md:grid-cols-2">
                  {filtered.slice(0, 2).map((p) => {
                    const cover = getCoverImage(p);
                    return (
                      <Link key={p._id} href={`/company/blog/${p.slug}`}>
                        <div className="group rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden shadow-[0_14px_70px_rgba(0,0,0,0.5)] hover:bg-white/[0.05] transition">
                          <div className="relative h-[220px]">
                            {cover ? (
                              <BlogImage
                                src={cover}
                                alt={p.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 grid place-items-center">
                                <div className="text-2xl font-semibold text-white/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                                  {p.category}
                                </div>
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
                                {p.category}
                              </span>
                            </div>
                            <div className="absolute top-4 right-4 size-9 rounded-full bg-white/10 border border-white/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                              <ArrowUpRight className="size-4 text-white/70" />
                            </div>
                          </div>
                          <div className="p-5">
                            <div
                              className="text-base font-medium tracking-tight text-white"
                              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                            >
                              {p.title}
                            </div>
                            <div className="mt-2 text-sm text-white/60">{p.description}</div>
                            <div className="mt-4 flex items-center gap-3 text-xs text-white/45">
                              <span>{formatDate(p.createdAt)}</span>
                              <span className="size-1 rounded-full bg-white/20" />
                              <span>{p.author}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Remaining Cards */}
                {filtered.length > 2 && (
                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.slice(2).map((p) => {
                      const cover = getCoverImage(p);
                      return (
                        <Link key={p._id} href={`/company/blog/${p.slug}`}>
                          <div className="group rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden shadow-[0_14px_70px_rgba(0,0,0,0.5)] hover:bg-white/[0.05] transition">
                            <div className="relative h-[180px]">
                              {cover ? (
                                <BlogImage
                                  src={cover}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <>
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
                                  <div className="h-full w-full grid place-items-center text-2xl font-semibold text-white/30" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                                    {p.title.split(" ")[0]}
                                  </div>
                                </>
                              )}
                              <div className="absolute top-4 left-4">
                                <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
                                  {p.category}
                                </span>
                              </div>
                              <div className="absolute top-4 right-4 size-9 rounded-full bg-white/10 border border-white/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                                <ArrowUpRight className="size-4 text-white/70" />
                              </div>
                            </div>
                            <div className="p-5">
                              <div
                                className="text-base font-medium tracking-tight text-white"
                                style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                              >
                                {p.title}
                              </div>
                              <div className="mt-2 text-sm text-white/60">{p.description}</div>
                              <div className="mt-4 flex items-center gap-3 text-xs text-white/45">
                                <span>{formatDate(p.createdAt)}</span>
                                <span className="size-1 rounded-full bg-white/20" />
                                <span>{p.author}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
