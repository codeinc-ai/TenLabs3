"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { AudioLines, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="size-8 rounded-xl tenlabs-glass tenlabs-ring grid place-items-center">
        <AudioLines className="size-4 text-white" strokeWidth={1.8} />
      </div>
      <div className="leading-none">
        <div
          className="text-[13px] tracking-tight text-white/90"
          style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
        >
          TenLabs
        </div>
      </div>
    </div>
  );
}

interface TenLabsNavProps {
  variant?: "default" | "sticky";
}

export default function TenLabsNav({ variant = "sticky" }: TenLabsNavProps) {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    if (!open && !megaOpen && !resourcesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMegaOpen(false);
        setResourcesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, megaOpen, resourcesOpen]);

  const top = [
    { href: "/creative-platform", label: "Creative Platform", hasMega: true },
    { href: "/agents-platform", label: "Agents Platform", hasMega: false },
    { href: "#", label: "Resources", hasMega: true },
    { href: "/pricing", label: "Pricing", hasMega: false },
  ] as const;

  const mega = {
    products: {
      title: "Products",
      items: [
        { href: "/creative-platform", label: "Product Overview", desc: "Discover TenLabs Creative Platform" },
        { href: "/products/studio", label: "Studio", desc: "Generate long-form audio" },
        { href: "/products/voice-library", label: "Voice Library", desc: "Voices for any character" },
        { href: "/products/productions", label: "Productions", desc: "Human-edited content" },
        { href: "/products/mobile-app", label: "Mobile App", desc: "Lifelike voiceovers wherever you go" },
      ],
    },
    create: {
      title: "Create",
      items: [
        { href: "/products/tts", label: "Text to Speech", desc: "Generate human-like AI voice" },
        { href: "/products/stt", label: "Speech to Text", desc: "Transcribe audio and video" },
        { href: "/products/voice-isolator", label: "Voice Isolator", desc: "Extract crystal-clear speech" },
        { href: "/products/sfx", label: "Sound Effects", desc: "Generate any sound" },
        { href: "/products/music", label: "Music", desc: "Turn an idea into a song" },
        { href: "/products/image-video", label: "Image & Video", desc: "Bring ideas to life" },
      ],
    },
    voice: {
      title: "Voice",
      items: [
        { href: "/products/voice-design", label: "Voice Design", desc: "Generate a custom voice" },
        { href: "/products/realtime-stt", label: "Realtime Speech to Text", desc: "Live speech transcription" },
        { href: "/products/voice-changer", label: "Voice Changer", desc: "Deliver your audio in any voice" },
        { href: "/products/voice-cloning", label: "Voice Cloning", desc: "Create a replica of your voice" },
        { href: "/products/dubbing", label: "Dubbing", desc: "Localize audio content" },
      ],
    },
  } as const;

  const resourcesItems = [
    { href: "/company/about", label: "About" },
    { href: "/company/safety", label: "Safety" },
    { href: "/company/stories", label: "Customer Stories" },
    { href: "/company/blog", label: "Blog" },
    { href: "/company/careers", label: "Careers" },
  ];

  const sticky = variant === "sticky";

  return (
    <div
      className={cn(
        "z-50 w-full",
        sticky ? "fixed left-0 top-0" : "absolute left-0 top-0"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 border-b border-white/5 transition-opacity",
          sticky ? "bg-black/55 backdrop-blur-xl opacity-100" : "bg-transparent opacity-0"
        )}
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/"
            className={cn("shrink-0 transition-opacity", sticky ? "opacity-100" : "opacity-100")}
            aria-label="TenLabs home"
          >
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-white/70">
            {top.map((it) => {
              if (it.label === "Creative Platform") {
                return (
                  <div
                    key={it.label}
                    className="relative"
                    onMouseEnter={() => {
                      setMegaOpen(true);
                      setResourcesOpen(false);
                    }}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <button
                      className={cn(
                        "relative rounded-full px-2.5 py-1.5 transition",
                        megaOpen ? "text-white" : "hover:text-white"
                      )}
                      aria-haspopup="menu"
                      aria-expanded={megaOpen}
                    >
                      {it.label}
                    </button>

                    <AnimatePresence>
                      {megaOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.985, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 14, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 10, scale: 0.99, filter: "blur(6px)" }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-0 top-full z-50 mt-2"
                          role="menu"
                        >
                          <div className="tenlabs-mega w-[860px] rounded-[28px] border border-white/10 bg-black/85 backdrop-blur-2xl tenlabs-ring overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
                            <div className="grid grid-cols-12">
                              <div className="col-span-4 p-6">
                                <div className="text-xs text-white/45">{mega.products.title}</div>
                                <div className="mt-4 grid gap-4">
                                  {mega.products.items.map((x) => (
                                    <Link
                                      key={x.href}
                                      href={x.href}
                                      className="group block rounded-2xl px-3 py-2.5 hover:bg-white/[0.05] transition"
                                      onClick={() => setMegaOpen(false)}
                                    >
                                      <div className="text-[13px] font-medium text-white/90 group-hover:text-white transition">
                                        {x.label}
                                      </div>
                                      <div className="mt-0.5 text-[12px] text-white/45 group-hover:text-white/55 transition">
                                        {x.desc}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>

                              <div className="col-span-8 border-l border-white/5">
                                <div className="grid grid-cols-2">
                                  <div className="p-6">
                                    <div className="text-xs text-white/45">{mega.create.title}</div>
                                    <div className="mt-4 grid gap-4">
                                      {mega.create.items.map((x) => (
                                        <Link
                                          key={x.href}
                                          href={x.href}
                                          className="group block rounded-2xl px-3 py-2.5 hover:bg-white/[0.05] transition"
                                          onClick={() => setMegaOpen(false)}
                                        >
                                          <div className="text-[13px] font-medium text-white/90 group-hover:text-white transition">
                                            {x.label}
                                          </div>
                                          <div className="mt-0.5 text-[12px] text-white/45 group-hover:text-white/55 transition">
                                            {x.desc}
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="p-6 border-l border-white/5">
                                    <div className="text-xs text-white/45">{mega.voice.title}</div>
                                    <div className="mt-4 grid gap-4">
                                      {mega.voice.items.map((x) => (
                                        <Link
                                          key={x.href}
                                          href={x.href}
                                          className="group block rounded-2xl px-3 py-2.5 hover:bg-white/[0.05] transition"
                                          onClick={() => setMegaOpen(false)}
                                        >
                                          <div className="text-[13px] font-medium text-white/90 group-hover:text-white transition">
                                            {x.label}
                                          </div>
                                          <div className="mt-0.5 text-[12px] text-white/45 group-hover:text-white/55 transition">
                                            {x.desc}
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="px-6 py-5 border-t border-white/5">
                                  <Link
                                    href="/products/tts"
                                    className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] transition px-4 py-3"
                                    onClick={() => setMegaOpen(false)}
                                  >
                                    <div className="size-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 grid place-items-center" aria-hidden>
                                      <div className="text-sm font-semibold text-white/90">V3</div>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[13px] font-medium text-white/90 group-hover:text-white">
                                        Meet TenLabs v3 (alpha)
                                      </div>
                                      <div className="mt-0.5 text-[12px] text-white/45 group-hover:text-white/55">
                                        The most expressive Text to Speech model
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            className="fixed inset-0 -z-10"
                            aria-hidden
                            onClick={() => setMegaOpen(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              if (it.label === "Resources") {
                return (
                  <div
                    key={it.label}
                    className="relative"
                    onMouseEnter={() => {
                      setResourcesOpen(true);
                      setMegaOpen(false);
                    }}
                    onMouseLeave={() => setResourcesOpen(false)}
                  >
                    <button
                      className={cn(
                        "relative rounded-full px-2.5 py-1.5 transition",
                        resourcesOpen ? "text-white" : "hover:text-white"
                      )}
                      aria-haspopup="menu"
                      aria-expanded={resourcesOpen}
                    >
                      {it.label}
                    </button>

                    <AnimatePresence>
                      {resourcesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.99, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 14, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 10, scale: 0.99, filter: "blur(6px)" }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-0 top-full z-50 mt-2"
                          role="menu"
                        >
                          <div className="w-[360px] rounded-[26px] border border-white/10 bg-black/85 backdrop-blur-2xl tenlabs-ring overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
                            <div className="p-6">
                              <div className="text-xs text-white/45">Company</div>
                              <div className="mt-4 grid gap-3">
                                {resourcesItems.map((x) => (
                                  <Link
                                    key={x.href}
                                    href={x.href}
                                    className="group block rounded-2xl px-3 py-2.5 hover:bg-white/[0.05] transition"
                                    onClick={() => setResourcesOpen(false)}
                                  >
                                    <div
                                      className="text-[22px] leading-[1.05] tracking-[-0.02em] font-medium text-white/92 group-hover:text-white"
                                      style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                                    >
                                      {x.label}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <button
                              className="fixed inset-0 -z-10"
                              aria-hidden
                              onClick={() => setResourcesOpen(false)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={it.label}
                  href={it.href}
                  className="hover:text-white transition"
                >
                  {it.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="secondary"
                  className="hidden sm:inline-flex bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                >
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="hidden sm:inline-flex bg-white text-black hover:bg-white/90 border border-white/10">
                  Sign up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="hidden sm:inline-flex bg-white text-black hover:bg-white/90 border border-white/10">
                  Dashboard
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>

            <button
              className="sm:hidden size-10 rounded-xl border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition grid place-items-center"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="sm:hidden"
            >
              <div className="mt-2 rounded-2xl border border-white/10 bg-black/75 backdrop-blur-xl tenlabs-ring overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <div className="text-xs text-white/55">Menu</div>
                  <button
                    className="size-9 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition grid place-items-center"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="px-3 pb-3 grid gap-1">
                  {top.map((it) => (
                    <Link
                      key={it.label}
                      href={it.href === "#" ? "/" : it.href}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80 hover:bg-white/[0.08] transition"
                      onClick={() => setOpen(false)}
                    >
                      <span>{it.label}</span>
                      <ArrowRight className="size-4 text-white/45" />
                    </Link>
                  ))}

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button
                          variant="secondary"
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                          onClick={() => setOpen(false)}
                        >
                          Log in
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button
                          className="w-full bg-white text-black hover:bg-white/90"
                          onClick={() => setOpen(false)}
                        >
                          Sign up
                        </Button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard" className="col-span-2" onClick={() => setOpen(false)}>
                        <Button className="w-full bg-white text-black hover:bg-white/90">
                          Dashboard
                        </Button>
                      </Link>
                    </SignedIn>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
