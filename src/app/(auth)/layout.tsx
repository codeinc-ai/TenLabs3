"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { AudioLines, Check, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function TenLabsMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
        <AudioLines className="size-4 text-white" strokeWidth={1.8} />
      </div>
      <div className="leading-none">
        <div
          className="text-[13px] tracking-tight text-white/90"
          style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
        >
          TenLabs.ai
        </div>
        <div className="text-[11px] text-white/50">Voice & Audio Platform</div>
      </div>
    </div>
  );
}

function LeftFeaturePanel({ mode }: { mode: "signin" | "signup" }) {
  const content = useMemo(() => {
    if (mode === "signup") {
      return {
        eyebrow: "Create your workspace",
        title: "Make voice UX feel alive — from day one.",
        desc: "Start with a premium UI system for audio products. Then wire in real models when you're ready.",
        bullets: [
          "Text to Speech demos that build trust",
          "Dubbing + remix workflows in minutes",
          "Consent-first cloning experiences",
        ],
        badge: "New",
      };
    }

    return {
      eyebrow: "Welcome back",
      title: "Sign in to your audio workspace.",
      desc: "Build realtime agents, generate voices, and ship studio-grade experiences — all in one place.",
      bullets: ["Low-latency UX patterns", "Premium component system", "Designed for teams"],
      badge: "Pro",
    };
  }, [mode]);

  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(202,220,252,0.24), transparent 55%), radial-gradient(circle at 80% 60%, rgba(246,231,216,0.14), transparent 55%), radial-gradient(circle at 50% 110%, rgba(255,255,255,0.10), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 tenlabs-grid opacity-[0.10] hidden md:block" />
      <div className="absolute inset-0 tenlabs-noise opacity-[0.22] hidden md:block" />

      <div className="relative p-8 lg:p-10 h-full flex flex-col">
        <TenLabsMark />

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
            <Sparkles className="size-3.5" />
            <span>{content.eyebrow}</span>
            <span className="mx-1 h-3 w-px bg-white/10" />
            <Badge className="bg-white text-black">{content.badge}</Badge>
          </div>

          <h1
            className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            {content.title}
          </h1>
          <p className="mt-4 text-white/65 text-base">{content.desc}</p>

          <div className="mt-7 grid gap-3">
            {content.bullets.map((b) => (
              <div
                key={b}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <div className="size-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white/85">
                  <Check className="size-4" strokeWidth={2.6} />
                </div>
                <div className="text-sm text-white/70">{b}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-10">
          <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                <Shield className="size-5 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div
                  className="text-sm font-medium text-white"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Crafted for trust
                </div>
                <div className="text-xs text-white/55">
                  Clear states, deliberate motion, and secure-by-design flows.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = pathname?.includes("sign-up") ? "signup" : "signin";

  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #000000 0%, #0a0a0a 100%)" }}
      />
      <div className="absolute inset-0 tenlabs-grid opacity-[0.12] hidden md:block" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-2 items-stretch">
          <div className="hidden lg:block rounded-3xl border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden min-h-[600px]">
            <LeftFeaturePanel mode={mode} />
          </div>

          <div className="grid place-items-center">
            <div className="w-full max-w-md">
              <div className="lg:hidden mb-6">
                <TenLabsMark />
              </div>

              {children}

              <div className="mt-6 text-xs text-white/45">
                <Link href="/" className="hover:text-white transition">
                  ← Back to TenLabs landing
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 hidden lg:block">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div
                  className="text-sm font-medium text-white"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Need enterprise onboarding?
                </div>
                <div className="mt-1 text-sm text-white/65">
                  SSO, custom voices, and SLAs — talk to sales for a guided setup.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    className="bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    Contact sales
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-white text-black hover:bg-white/90">
                    Start free
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
