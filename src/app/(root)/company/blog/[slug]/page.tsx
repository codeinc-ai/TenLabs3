"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AudioLines, ArrowLeft, ArrowRight } from "lucide-react";

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

const posts: Record<
  string,
  {
    chip: string;
    title: string;
    desc: string;
    author: string;
    date: string;
    content: string;
  }
> = {
  "series-d": {
    chip: "Company",
    title: "TenLabs raises $500M Series D at $11B valuation",
    desc: "Transforming how we interact with technology",
    author: "Team TenLabs",
    date: "Feb 2, 2026",
    content: `We're excited to announce our Series D funding round of $500 million, valuing TenLabs at $11 billion. This milestone reflects the growing demand for AI-powered audio technology and our commitment to transforming how people create and interact with sound.

## Our Journey

Since our founding, we've been on a mission to make AI audio accessible to everyone. What started as a small team passionate about voice technology has grown into a global company serving millions of users.

## What This Means

This funding will accelerate our product development, expand our research capabilities, and help us bring advanced AI audio tools to more creators and businesses around the world.

### Key Areas of Investment

1. **Research & Development** - Advancing our core AI models
2. **Global Expansion** - Growing our presence in new markets
3. **Enterprise Solutions** - Building tools for larger organizations
4. **Safety & Ethics** - Continuing to lead in responsible AI

## Looking Ahead

We're just getting started. Thank you to our users, partners, and team for being part of this journey. The future of audio is here, and we're building it together.`,
  },
  "v3-ga": {
    chip: "Research",
    title: "Ten v3 is Now Generally Available",
    desc: "Ten v3 is now out of Alpha.",
    author: "Joe Reeve",
    date: "Feb 2, 2026",
    content: `After months of testing and refinement, we're thrilled to announce that Ten v3 is now generally available to all users.

## What's New in v3

Ten v3 represents a significant leap forward in voice synthesis quality and capabilities:

- **Improved Naturalness** - More human-like intonation and emotion
- **Faster Generation** - 2x speed improvement over v2
- **Better Multilingual Support** - Enhanced performance across 32 languages
- **Lower Latency** - Ideal for real-time applications

## Getting Started

Existing users can upgrade to v3 directly from their dashboard. New users can sign up and start using v3 immediately.

Thank you to everyone who participated in our alpha testing. Your feedback was instrumental in making v3 our best release yet.`,
  },
  revolut: {
    chip: "Agents Platform Stories",
    title: "Revolut selects TenAgents to bolster customer support",
    desc: "Voice agents at scale with privacy-first workflows",
    author: "Stan Messuares",
    date: "Jan 29, 2026",
    content: `Revolut, the global financial super app, has selected TenAgents to power their next-generation customer support experience.

## The Challenge

With millions of customers across 38 countries, Revolut needed a solution that could:
- Handle high volumes of support inquiries
- Maintain consistent quality across languages
- Ensure data privacy and security

## The Solution

TenAgents provides Revolut with AI-powered voice agents that deliver natural, helpful support in multiple languages while maintaining the highest standards of data protection.

## Results

Early results show significant improvements in customer satisfaction and response times, with agents handling thousands of conversations daily.`,
  },
  grid: {
    chip: "Company",
    title: "We are on the grid",
    desc: "TenLabs is an official partner of a global team",
    author: "Carles Reina",
    date: "Jan 29, 2026",
    content: `We're excited to announce a new partnership that brings TenLabs to the world of motorsport.

## The Partnership

As an official partner, TenLabs will provide AI audio technology to enhance fan experiences and team communications.

## What This Means

- Multilingual content for global fans
- Real-time audio processing for broadcasts
- Innovative fan engagement features

Stay tuned for more updates as we accelerate into this exciting new chapter.`,
  },
  masterclass: {
    chip: "API Platform Stories",
    title: "MasterClass brings AI instructors to life",
    desc: "75% of users prefer voice interactions",
    author: "Fergal Burnett",
    date: "Jan 5, 2026",
    content: `MasterClass is transforming online education with TenLabs' voice technology, creating more engaging and accessible learning experiences.

## The Impact

Since implementing TenLabs' API:
- 75% of users report preferring voice-based interactions
- Course completion rates have increased by 40%
- Content is now accessible in 20+ languages

## How It Works

MasterClass uses our API to create voice-enabled course companions that guide learners through material, answer questions, and provide encouragement.

The future of education is personalized, accessible, and powered by voice.`,
  },
  liberty: {
    chip: "Agents Platform Stories",
    title: "We're partnering with Liberty Global to accelerate voice AI",
    desc: "Expansion across regions",
    author: "Carles Reina",
    date: "Nov 21, 2025",
    content: `TenLabs and Liberty Global are joining forces to bring advanced voice AI capabilities to millions of customers across Europe and Latin America.

## The Partnership

This strategic partnership will focus on:
- Customer service automation
- Content accessibility
- Interactive entertainment experiences

## Looking Ahead

Together, we're committed to making voice AI accessible and beneficial for customers across all markets.`,
  },
  "image-video": {
    chip: "Product",
    title: "Introducing TenLabs Image & Video",
    desc: "Bring ideas to life in one creative suite",
    author: "Team TenLabs",
    date: "Dec 1, 2025",
    content: `Today we're launching TenLabs Image & Video, expanding our creative suite beyond audio to help you bring any idea to life.

## What's Included

- **AI Image Generation** - Create stunning visuals from text
- **Video Synthesis** - Generate video content with AI
- **Seamless Integration** - Works perfectly with our audio tools

## Getting Started

All TenLabs users can access Image & Video features from their dashboard. Visit the new Creative Suite section to explore what's possible.`,
  },
  toyota: {
    chip: "Agents Platform Stories",
    title: "Toyota engages fans with AI-powered experience",
    desc: "Driving deeper engagement",
    author: "Team TenLabs",
    date: "Dec 1, 2025",
    content: `Toyota is using TenLabs' voice technology to create immersive experiences for motorsport fans around the world.

## The Experience

Fans can now:
- Get real-time race updates in their preferred language
- Interact with AI-powered companions during events
- Access exclusive content through voice commands

## Results

Fan engagement metrics have shown significant improvements since launch, with users spending more time interacting with Toyota's digital platforms.`,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = posts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <TopBar label="Blog" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold">Post not found</h1>
          <p className="mt-4 text-white/60">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/company/blog"
            className="mt-8 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-white/90 transition"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="relative mx-auto max-w-4xl px-4 pt-14 md:pt-20 pb-8">
            <Link
              href="/company/blog"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
            >
              <ArrowLeft className="size-4" />
              Back to Blog
            </Link>

            <div className="mt-8">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
                {post.chip}
              </span>
            </div>

            <h1
              className="mt-6 text-3xl md:text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-white/60">{post.desc}</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="size-10 rounded-full bg-white/10" />
              <div>
                <div className="text-sm font-medium text-white">{post.author}</div>
                <div className="text-xs text-white/50">{post.date}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="relative py-10 md:py-16">
          <div className="absolute inset-0 bg-white" />
          <div className="relative mx-auto max-w-4xl px-4">
            <div className="rounded-[28px] border border-black/10 bg-[#f5f3ef] overflow-hidden mb-10">
              <div className="h-[300px] md:h-[400px] bg-gradient-to-br from-black/5 to-black/0 grid place-items-center">
                <div
                  className="text-3xl font-semibold text-black/30"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  {post.chip}
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:text-black/70 prose-li:text-black/70 prose-strong:text-black">
              {post.content.split("\n\n").map((paragraph, i) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="mt-10 mb-4 text-2xl font-semibold text-black"
                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="mt-8 mb-3 text-xl font-semibold text-black"
                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                    >
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("1. ") || paragraph.startsWith("- ")) {
                  const items = paragraph.split("\n");
                  const isOrdered = paragraph.startsWith("1. ");
                  const ListTag = isOrdered ? "ol" : "ul";
                  return (
                    <ListTag key={i} className={isOrdered ? "list-decimal pl-6" : "list-disc pl-6"}>
                      {items.map((item, j) => (
                        <li key={j} className="mt-2 text-black/70">
                          {item.replace(/^\d+\.\s|\-\s/, "")}
                        </li>
                      ))}
                    </ListTag>
                  );
                }
                return (
                  <p key={i} className="mt-4 text-[15px] leading-7 text-black/70">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Author Card */}
            <div className="mt-16 rounded-[22px] border border-black/10 bg-black/[0.02] p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-black/10" />
                <div>
                  <div className="text-sm font-medium text-black">Written by {post.author}</div>
                  <div className="text-xs text-black/50">{post.date}</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <Link
                href="/company/blog"
                className="inline-flex h-10 items-center rounded-full border border-black/10 bg-white px-4 text-sm text-black/75 hover:bg-black/[0.03] transition"
              >
                <ArrowLeft className="mr-2 size-4" />
                More articles
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
