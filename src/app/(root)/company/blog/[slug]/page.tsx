"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BlogImage } from "@/components/blog/BlogImage";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  AudioLines,
  ArrowRight,
  Twitter,
  Linkedin,
  Facebook,
  Play,
  Pause,
} from "lucide-react";
import { BlogPost } from "@/types/BlogTypes";

// Mapping of slug to cover image
const coverImages: Record<string, string> = {
  "series-d": "/images/landing/company-blog-hero.png",
  "v3-ga": "/images/landing/company-blog-research.png",
};

function TopBar() {
  return (
    <div className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl border-b border-white/5" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/company/blog"
            className="flex items-center gap-2 text-sm text-white/75 hover:text-white transition"
          >
            <ArrowRight className="size-4 rotate-180 text-white/45" /> Back
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="size-8 rounded-xl tenlabs-glass tenlabs-ring grid place-items-center">
                <AudioLines className="size-4 text-white" strokeWidth={1.8} />
              </div>
            </Link>
          </div>

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Extract headings from markdown for table of contents
function extractHeadings(content: string): { id: string; label: string }[] {
  const headings: { id: string; label: string }[] = [];
  const regex = /^#{1,2} (.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const label = match[1];
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, label });
  }

  return headings;
}

// Simple markdown to HTML conversion
function renderMarkdown(content: string): string {
  // Convert headers with IDs (highlighted with accent border and background)
  let html = content
    .replace(/^### (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h3 id="${id}" class="text-lg md:text-xl font-semibold mt-8 mb-3 text-white pl-4 py-2 rounded-lg border-l-4 border-white/30 bg-white/[0.06]" style="font-family: Plus Jakarta Sans, var(--font-sans)">${text}</h3>`;
    })
    .replace(/^## (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h2 id="${id}" class="text-xl md:text-2xl font-semibold mt-10 mb-4 text-white pl-4 py-3 rounded-lg border-l-4 border-white/40 bg-white/[0.08]" style="font-family: Plus Jakarta Sans, var(--font-sans)">${text}</h2>`;
    })
    .replace(/^# (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h1 id="${id}" class="text-2xl md:text-3xl font-bold mt-12 mb-6 text-white pl-4 py-3 rounded-lg border-l-4 border-white/50 bg-white/[0.08]" style="font-family: Plus Jakarta Sans, var(--font-sans)">${text}</h1>`;
    });

  // Convert bold and italic
  html = html
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white/90'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Convert links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Convert images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="w-full rounded-xl my-6" />'
  );

  // Convert code blocks
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre class="bg-white/5 rounded-lg p-4 my-4 overflow-x-auto border border-white/10"><code class="text-sm text-white/80">$2</code></pre>'
  );

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm text-white/80">$1</code>');

  // Convert blockquotes
  html = html.replace(
    /^> (.*)$/gim,
    '<blockquote class="border-l-4 border-white/20 pl-4 italic text-white/60 my-4">$1</blockquote>'
  );

  // Convert unordered lists
  html = html.replace(/^\- (.*)$/gim, '<li class="ml-4 text-white/70">$1</li>');
  html = html.replace(/(<li.*<\/li>)\n(<li)/g, "$1\n$2");
  html = html.replace(
    /(<li class="ml-4 text-white\/70">.*<\/li>(\n|$))+/g,
    '<ul class="list-disc list-inside my-4 space-y-1">$&</ul>'
  );

  // Convert paragraphs
  html = html
    .split("\n\n")
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return trimmed;
      return `<p class="text-[15px] leading-7 text-white/70 mb-4">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

// Fallback content for demo posts
const fallbackContent: Record<string, BlogPost> = {
  "series-d": {
    _id: "series-d",
    slug: "series-d",
    category: "Company",
    title: "TenLabs raises $500M Series D at $11B valuation",
    description: "Transforming how we interact with technology",
    content: `## The Future of Voice AI

Today, we're excited to announce that TenLabs has raised $500M in our Series D funding round, valuing the company at $11 billion. This milestone represents a transformative moment not just for our company, but for the entire voice AI industry.

## What This Means for Our Mission

Our mission has always been clear: to make voice AI accessible, natural, and powerful for everyone. With this new funding, we're accelerating our efforts in several key areas:

- **Research & Development**: Expanding our team of world-class researchers to push the boundaries of voice synthesis and understanding.
- **Infrastructure**: Building the most reliable and scalable voice AI platform in the world.
- **Global Expansion**: Bringing our technology to new markets and supporting more languages.

## Looking Ahead

We believe voice is the most natural interface for human-computer interaction. As AI continues to evolve, the ability to communicate naturally through voice will become increasingly important.

> "This funding allows us to double down on our vision of creating voice AI that's indistinguishable from human speech." - Team TenLabs

Thank you to our customers, partners, and the entire TenLabs community for believing in our vision. The best is yet to come.`,
    author: "Team TenLabs",
    authorRole: "TenLabs",
    coverImage: "/images/landing/company-blog-hero.png",
    createdAt: "2026-02-02T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
    featured: true,
    published: true,
  },
  "v3-ga": {
    _id: "v3-ga",
    slug: "v3-ga",
    category: "Research",
    title: "Ten v3 is Now Generally Available",
    description: "Ten v3 is now out of Alpha.",
    content: `Ten v3, our most advanced Text to Speech model, is now out of Alpha and generally available.

## Introduction

Since the Alpha release, we've continued refining the model. Two key improvements: more stable delivery and more accurate handling of numbers and symbols.

## Accuracy improvements

Text to Speech models need to interpret what you write and decide how to say it. Symbols can mean different things in different contexts.

## Availability

Ten v3 is available in Studio and via API. If you're already a customer, you can start using it today.`,
    author: "Joe Reeve",
    authorRole: "Growth",
    coverImage: "/images/landing/company-blog-research.png",
    createdAt: "2026-02-02T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
    featured: false,
    published: true,
  },
};

// Audio Player Component
function AudioPlayer({ title }: { title: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(38);

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
      <div className="p-5 flex items-center gap-4">
        <button
          onClick={() => setPlaying(!playing)}
          className="size-11 rounded-full bg-white text-black hover:bg-white/90 transition grid place-items-center shrink-0"
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-white/80 truncate">{title}</div>
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white/60 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-xs text-white/45 shrink-0">02:42</div>
      </div>
    </div>
  );
}

// Related Post Card
function RelatedPostCard({ title, category, description, onClick }: {
  title: string;
  category: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left group rounded-[22px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.045] transition overflow-hidden"
    >
      <div className="h-28 bg-gradient-to-br from-white/10 to-white/0" />
      <div className="p-5">
        <div className="text-sm text-white/70">{category}</div>
        <div className="mt-2 text-base font-medium text-white/90">{title}</div>
        <div className="mt-2 text-sm text-white/60">{description}</div>
      </div>
    </button>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.post);
        } else if (fallbackContent[slug]) {
          setPost(fallbackContent[slug]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
        if (fallbackContent[slug]) {
          setPost(fallbackContent[slug]);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const headings = useMemo(() => {
    if (!post?.content) return [];
    return extractHeadings(post.content);
  }, [post?.content]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return "";
    return renderMarkdown(post.content);
  }, [post?.content]);

  const readingTime = useMemo(() => {
    if (!post?.content) return 2;
    return estimateReadingTime(post.content);
  }, [post?.content]);

  const handleShare = (platform: "twitter" | "linkedin" | "facebook") => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || "");

    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const coverImage = post?.coverImage || coverImages[slug] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <TopBar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <TopBar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-white/50 mb-4">Post not found</div>
          <Link
            href="/company/blog"
            className="text-sm text-white/70 hover:text-white flex items-center gap-2"
          >
            <ArrowRight className="size-4 rotate-180" />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar />

      <main>
        <section className="relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1200px 700px at 50% -40%, rgba(255,255,255,0.16), rgba(0,0,0,0) 60%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-14">
            <div className="grid gap-10 md:grid-cols-[260px_1fr]">
              {/* Sidebar - On this page */}
              <aside className="hidden md:block">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-3">On this page</div>
                  <nav className="space-y-2">
                    {headings.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="block text-sm text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg px-3 py-2 transition"
                      >
                        {s.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <div>
                {/* Tags */}
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
                    Blog
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="mt-6 text-3xl md:text-5xl font-semibold tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="mt-3 text-sm text-white/55">
                  Last updated {formatDate(post.updatedAt)} • {readingTime} minute{readingTime > 1 ? "s" : ""} reading time
                </div>
                <div className="mt-2 text-sm text-white/65">
                  {post.author}{post.authorRole ? `, ${post.authorRole}` : ""}
                </div>

                {/* Lede */}
                <p className="mt-6 text-[15px] leading-7 text-white/70">
                  {post.description}
                </p>

                {/* Cover Image */}
                {coverImage && (
                  <div className="mt-10 rounded-[26px] border border-white/10 bg-white/[0.03] overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
                    <BlogImage
                      src={coverImage}
                      alt={post.title}
                      width={800}
                      height={340}
                      className="w-full h-[260px] md:h-[340px] object-cover"
                    />
                  </div>
                )}

                {/* Audio Player */}
                <div className="mt-6">
                  <AudioPlayer title={post.title} />
                </div>

                {/* Content */}
                <div
                  className="mt-10 space-y-6"
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href="/sign-up"
                    className="h-10 inline-flex items-center rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-white/90 transition"
                  >
                    Get started free
                  </Link>
                  <Link
                    href="/company/blog"
                    className="h-10 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white/80 hover:bg-white/[0.06] transition"
                  >
                    Explore articles
                  </Link>
                </div>

                {/* Share */}
                <div className="mt-10 flex items-center gap-3">
                  <span className="text-sm text-white/50">Share:</span>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="size-9 rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition grid place-items-center"
                  >
                    <Twitter className="size-4" />
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="size-9 rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition grid place-items-center"
                  >
                    <Linkedin className="size-4" />
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="size-9 rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition grid place-items-center"
                  >
                    <Facebook className="size-4" />
                  </button>
                </div>

                {/* Related Posts */}
                <div className="mt-14">
                  <h3
                    className="text-xl font-semibold"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    Explore articles by the TenLabs team
                  </h3>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <RelatedPostCard
                      title="TenLabs raises Series D"
                      category="Company"
                      description="Scaling personalized outreach with voice."
                      onClick={() => router.push("/company/blog/series-d")}
                    />
                    <RelatedPostCard
                      title="Revolut selects TenAgents"
                      category="Agents Platform Stories"
                      description="Voice agents at scale with privacy-first workflows."
                      onClick={() => router.push("/company/blog/revolut")}
                    />
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
