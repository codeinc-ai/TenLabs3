"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  AudioLines,
  Check,
  CreditCard,
  LogIn,
  Minus,
  Plus,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/Aurora";

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] transition overflow-hidden"
      data-testid={`card-faq-${q}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.03] transition"
        data-testid={`button-faq-${q}`}
      >
        <div
          className="text-sm font-medium text-white/90"
          data-testid={`text-faq-q`}
        >
          {q}
        </div>
        <div className="size-8 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/60">
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </div>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-6 pb-6 text-sm text-white/60 leading-7"
              data-testid={`text-faq-a`}
            >
              {a}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Auto-fill code from sessionStorage if user was redirected back after login
  useEffect(() => {
    const pending = sessionStorage.getItem("pending_redeem_code");
    if (pending) {
      setCode(pending);
      sessionStorage.removeItem("pending_redeem_code");
    }
  }, []);

  const [redeemResult, setRedeemResult] = useState<{
    type?: "direct_upgrade" | "discount";
    plan?: string;
    durationDays?: number;
    discountPercent?: number;
  } | null>(null);

  const handleRedeem = async () => {
    if (!code) return;
    setLoading(true);
    setError(false);
    setShowLoginPopup(false);

    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      // If user is not logged in, API returns 401
      if (res.status === 401) {
        setShowLoginPopup(true);
        setLoading(false);
        return;
      }

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || "Invalid code. Please try again.");
        setLoading(false);
        return;
      }

      setRedeemResult(result);
      setRedeemed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Save the code in sessionStorage so user can redeem after login
    if (code.trim()) {
      sessionStorage.setItem("pending_redeem_code", code.trim());
    }
    router.push(`/sign-in?redirect_url=/redeem`);
  };

  return (
    <div className="min-h-screen bg-black text-white" data-testid="page-redeem">
      <main>
        <section
          className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
          data-testid="section-redeem-hero"
        >
          {/* Aurora background */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <Aurora
              colorStops={["#2a0ca1", "#d24646", "#281183"]}
              amplitude={2}
              blend={0.5}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04), rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(10,10,10,0.5) 100%)",
              zIndex: 1,
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 tenlabs-grid opacity-[0.14]"
            style={{ zIndex: 2 }}
            aria-hidden
          />

          <div
            className="relative mx-auto max-w-lg px-4 text-center"
            style={{ zIndex: 10 }}
          >
            <Reveal>
              <div className="mx-auto size-16 rounded-[22px] border border-white/10 bg-white/[0.03] tenlabs-ring grid place-items-center mb-8">
                <Tag className="size-7 text-white" strokeWidth={1.5} />
              </div>

              <h1
                className="text-4xl md:text-5xl font-semibold tracking-tight"
                style={{
                  fontFamily: "Plus Jakarta Sans, var(--font-sans)",
                }}
                data-testid="text-redeem-title"
              >
                Redeem your code
              </h1>
              <p
                className="mt-4 text-[15px] leading-7 text-white/60"
                data-testid="text-redeem-desc"
              >
                Enter your coupon code below to unlock premium features, add
                credits, or activate a special plan.
              </p>

              <div className="mt-10 relative">
                <AnimatePresence mode="wait">
                  {!redeemed ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value);
                            setError(false);
                            setShowLoginPopup(false);
                          }}
                          placeholder="ENTER-CODE-HERE"
                          className="relative w-full h-14 bg-black border border-white/10 rounded-xl px-5 text-center text-lg tracking-widest uppercase placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition shadow-2xl"
                          data-testid="input-redeem-code"
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-red-400 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      <Button
                        onClick={handleRedeem}
                        disabled={!code || loading}
                        className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 text-[15px] font-medium transition shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="button-redeem-submit"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Checking...
                          </div>
                        ) : (
                          "Redeem Code"
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] tenlabs-ring backdrop-blur-xl"
                    >
                      <div className="mx-auto size-12 rounded-full bg-green-500/20 text-green-400 grid place-items-center mb-4">
                        <Check className="size-6" strokeWidth={3} />
                      </div>
                      
                      <div className="text-xl font-semibold text-white">
                        Code Redeemed!
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        {redeemResult?.type === "direct_upgrade" ? (
                          <>
                            You&apos;ve been upgraded to the{" "}
                            <strong className="text-white capitalize">{redeemResult.plan} Plan</strong>{" "}
                            for {redeemResult.durationDays} days.
                          </>
                        ) : (
                          <>
                            You&apos;ve received a{" "}
                            <strong className="text-white">{redeemResult?.discountPercent}% discount</strong>{" "}
                            on your next plan upgrade (valid for {redeemResult?.durationDays} days).
                          </>
                        )}
                      </div>
                      <div className="mt-6 flex flex-col gap-3">
                        {redeemResult?.type === "direct_upgrade" ? (
                          <Button
                            className="w-full bg-white text-black hover:bg-white/90 rounded-xl"
                            asChild
                          >
                            <Link href="/tts">
                              Start Creating
                              <ArrowRight className="ml-2 size-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-white text-black hover:bg-white/90 rounded-xl"
                            asChild
                          >
                            <Link href="/billing">
                              View Plans & Upgrade
                              <ArrowRight className="ml-2 size-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>

          {/* Login popup overlay */}
          <AnimatePresence>
            {showLoginPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                onClick={() => setShowLoginPopup(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative w-full max-w-md p-8 rounded-3xl border border-white/10 bg-[#111] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowLoginPopup(false)}
                    className="absolute top-4 right-4 size-8 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/60 hover:text-white hover:bg-white/10 transition"
                  >
                    <X className="size-4" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className="size-14 rounded-2xl border border-white/10 bg-white/[0.05] grid place-items-center mb-5">
                      <LogIn className="size-6 text-white" strokeWidth={1.8} />
                    </div>

                    <h2
                      className="text-xl font-semibold text-white"
                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                    >
                      Sign in to redeem
                    </h2>
                    <p className="mt-2 text-sm text-white/55 leading-relaxed">
                      You need to be logged in to use your promo code.
                      Sign in or create an account first, then redeem your code.
                    </p>

                    {code.trim() && (
                      <div className="mt-4 w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                        <p className="text-xs text-white/40 mb-1">Your code</p>
                        <p className="text-sm font-mono tracking-widest text-white uppercase">
                          {code.trim()}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 w-full">
                      <Button
                        onClick={handleLoginRedirect}
                        className="w-full h-11 rounded-xl bg-white text-black hover:bg-white/90 font-medium"
                      >
                        Sign In
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (code.trim()) {
                            sessionStorage.setItem("pending_redeem_code", code.trim());
                          }
                          router.push(`/sign-up?redirect_url=/redeem`);
                        }}
                        variant="secondary"
                        className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium"
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section
          className="relative py-20 border-t border-white/5"
          data-testid="section-redeem-features"
        >
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="text-center mb-16">
                <h2
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{
                    fontFamily: "Plus Jakarta Sans, var(--font-sans)",
                  }}
                >
                  What you unlock
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Premium Voices",
                  desc: "Access our highest fidelity models with extended context and nuance.",
                  icon: <AudioLines className="size-5 text-white" />,
                },
                {
                  title: "Instant Cloning",
                  desc: "Clone any voice from a short sample in seconds with high accuracy.",
                  icon: <Check className="size-5 text-white" />,
                },
                {
                  title: "Commercial Rights",
                  desc: "Full commercial usage rights for all content you generate.",
                  icon: <CreditCard className="size-5 text-white" />,
                },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition tenlabs-ring">
                    <div className="size-10 rounded-xl border border-white/10 bg-white/5 grid place-items-center mb-4">
                      {f.icon}
                    </div>
                    <div className="text-lg font-medium text-white mb-2">
                      {f.title}
                    </div>
                    <div className="text-sm text-white/50 leading-relaxed">
                      {f.desc}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          className="relative py-20"
          data-testid="section-redeem-faq"
        >
          <div className="relative mx-auto max-w-3xl px-4">
            <Reveal>
              <div className="text-center mb-12">
                <h2
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{
                    fontFamily: "Plus Jakarta Sans, var(--font-sans)",
                  }}
                >
                  Common questions
                </h2>
              </div>
            </Reveal>

            <div className="space-y-3">
              {[
                {
                  q: "Where can I find my coupon code?",
                  a: "Codes are typically sent via email during promotions, events, or partner offers. Check your inbox for emails from TenLabs.",
                },
                {
                  q: "Do coupons expire?",
                  a: "Yes, most coupons have an expiration date. If your code is invalid, it may have expired or reached its usage limit.",
                },
                {
                  q: "Can I stack multiple coupons?",
                  a: "Generally, only one coupon code can be active at a time per subscription period, unless specified otherwise.",
                },
                {
                  q: "What happens after the coupon period ends?",
                  a: "Your subscription will automatically renew at the standard rate unless you cancel before the period ends.",
                },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <FAQItem q={f.q} a={f.a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
