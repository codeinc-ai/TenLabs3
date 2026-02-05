"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  AudioLines,
  Sparkles,
  Waves,
  Mic,
  Shield,
  Zap,
  Globe,
  Cpu,
  ArrowRight,
  ArrowUpRight,
  Play,
  Pause,
  Check,
  Command,
  Languages,
  Wand2,
  CopyPlus,
  UserRound,
} from "lucide-react";
import { BlogPost } from "@/types/BlogTypes";
import { BlogImage } from "@/components/blog/BlogImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/landing";

type AgentState = "connecting" | "initializing" | "listening" | "speaking" | "thinking";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

function useInMemoryDemoState() {
  const states: AgentState[] = useMemo(
    () => ["connecting", "initializing", "listening", "thinking", "speaking"],
    []
  );
  const [idx, setIdx] = useState(0);
  useInterval(() => {
    setIdx((v) => (v + 1) % states.length);
  }, 4200);
  return states[idx];
}

// Orb Demo Component
function OrbDemo({ state }: { state: AgentState }) {
  const reduce = useReducedMotion();
  const intensity =
    state === "speaking" ? 1 : state === "thinking" ? 0.75 : state === "listening" ? 0.6 : 0.35;

  return (
    <div className="relative">
      <div
        className="absolute -inset-12 rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), transparent 60%)",
          filter: "blur(1px)",
          opacity: 0.9,
        }}
      />
      <motion.div
        className="relative mx-auto size-[260px] md:size-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 30% 25%, rgba(202,220,252,0.85), rgba(160,185,209,0.35) 40%, rgba(255,255,255,0.06) 66%, rgba(0,0,0,0.1) 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.10) inset, 0 20px 80px rgba(0,0,0,0.75), 0 0 120px rgba(255,255,255,0.08)",
        }}
        animate={{
          scale: 1 + intensity * 0.03,
          rotate: state === "speaking" ? 6 : state === "thinking" ? -4 : 0,
        }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), transparent 35%), radial-gradient(circle at 70% 72%, rgba(255,255,255,0.12), transparent 46%)",
            mixBlendMode: "soft-light",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(202,220,252,0.0), rgba(202,220,252,0.22), rgba(160,185,209,0.0), rgba(246,231,216,0.14), rgba(202,220,252,0.0))",
            filter: "blur(0.2px)",
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined : { repeat: Infinity, duration: 18, ease: "linear" }}
        />
        <div className="absolute inset-0 rounded-full tenlabs-noise hidden md:block" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-white/70">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-30 bg-white/70" />
              <motion.span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  state === "speaking" ? "bg-white" : state === "thinking" ? "bg-white/80" : "bg-white/70"
                )}
                animate={{
                  scale: state === "speaking" ? [1, 1.35, 1] : state === "thinking" ? [1, 1.2, 1] : [1, 1.15, 1],
                }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <span className="capitalize">{state}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Bar Visualizer Component
function BarVizDemo({ state }: { state: AgentState }) {
  const bars = 22;
  const reduce = useReducedMotion();
  const [seed] = useState(() => Math.random());

  return (
    <div className="flex items-end justify-center gap-1.5 h-24">
      {Array.from({ length: bars }).map((_, i) => {
        const phase = (i / bars) * Math.PI * 2;
        const base = 0.18 + (Math.sin(phase + seed * 6) + 1) * 0.14;
        const amp =
          state === "speaking" ? 0.55 : state === "listening" ? 0.4 : state === "thinking" ? 0.32 : 0.22;
        const dur = 1.2 + (i % 6) * 0.12;
        const delay = (i % 7) * 0.03;

        return (
          <motion.div
            key={i}
            className="w-[7px] rounded-full"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.22))",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
            initial={false}
            animate={
              reduce
                ? { height: `${(base + amp) * 100}%`, opacity: 0.9 }
                : {
                    height: [`${(base + amp * 0.35) * 100}%`, `${(base + amp) * 100}%`, `${(base + amp * 0.45) * 100}%`],
                    opacity: state === "connecting" ? 0.6 : 0.95,
                  }
            }
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
          />
        );
      })}
    </div>
  );
}

// Sparkline Component
function SparkLine({ values }: { values: number[] }) {
  const d = useMemo(() => {
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const w = 240;
    const h = 44;
    const pad = 2;
    const step = w / Math.max(1, values.length - 1);
    const pts = values.map((v, i) => {
      const x = i * step;
      const y = pad + (1 - clamp(v)) * (h - pad * 2);
      return [x, y] as const;
    });
    return `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")}`;
  }, [values]);

  return (
    <svg viewBox="0 0 240 44" fill="none" className="w-full h-11" preserveAspectRatio="none">
      <path d={d} stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
      <path
        d={d}
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 6px 20px rgba(255,255,255,0.10))" }}
      />
    </svg>
  );
}

// Text to Speech Demo
function TextToSpeechDemo() {
  const presets = [
    { id: "product", label: "Product copy", text: "Meet TenLabs — premium voice that sounds human, not generated." },
    { id: "support", label: "Support agent", text: "I can help with billing, plans, or a quick voice sample — what are you building?" },
    { id: "creator", label: "Creator intro", text: "Welcome back. Today we're turning scripts into cinematic narration in minutes." },
  ] as const;

  const [preset, setPreset] = useState<(typeof presets)[number]>(presets[0]);
  const [text, setText] = useState<string>(preset.text);
  const [voice, setVoice] = useState("Atlas");
  const [style, setStyle] = useState("Neutral");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setText(preset.text);
  }, [preset]);

  useInterval(() => {
    if (playing) setPlaying(false);
  }, playing ? 5200 : null);

  const waveform = useMemo(() => {
    const base = playing ? 0.65 : 0.28;
    return Array.from({ length: 34 }).map((_, i) => {
      const s = Math.sin(i * 0.55) * 0.22 + Math.sin(i * 0.18) * 0.15;
      const n = (Math.sin(i * 1.9) + 1) * 0.06;
      return Math.max(0.06, Math.min(1, base + s + n));
    });
  }, [playing]);

  return (
    <Card className="border-white/10 bg-white/[0.03] hover:bg-white/[0.045] transition tenlabs-ring tenlabs-glass">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/55">Text to Speech</div>
            <div className="mt-1 text-base font-medium text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
              Generate lifelike audio from any script
            </div>
          </div>
          <Button onClick={() => setPlaying((v) => !v)} className="bg-white text-black hover:bg-white/90">
            {playing ? <><Pause className="mr-2 size-4" /> Stop</> : <><Play className="mr-2 size-4" /> Generate</>}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                p.id === preset.id ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="text-[11px] text-white/55">Voice</div>
            <div className="mt-1 flex gap-2">
              {["Atlas", "Nova", "Sable"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={cn(
                    "flex-1 rounded-xl border px-2 py-2 text-xs transition",
                    v === voice ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="text-[11px] text-white/55">Style</div>
            <div className="mt-1 flex gap-2">
              {["Neutral", "Warm", "Cinematic"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "flex-1 rounded-xl border px-2 py-2 text-xs transition",
                    s === style ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="text-[11px] text-white/55">Export</div>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {["WAV", "MP3", "48kHz", "24kHz"].map((t) => (
                <div key={t} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[11px] text-white/70">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] text-white/55">Script</div>
            <div className="text-[11px] text-white/45">{text.length.toLocaleString()} characters</div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 h-24 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 outline-none ring-0 placeholder:text-white/35 focus:border-white/20"
            placeholder="Paste a script…"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-white/55">Preview</div>
            <Badge className="bg-white/10 text-white border border-white/10">{voice} · {style}</Badge>
          </div>
          <div className="mt-3">
            <SparkLine values={waveform} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[11px] text-white/45">Demo waveform (visual only)</div>
            <div className="text-[11px] text-white/45">00:00 / 00:12</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Dubbing Demo
function DubbingDemo() {
  const languages = [
    { id: "en", label: "English" },
    { id: "es", label: "Spanish" },
    { id: "fr", label: "French" },
    { id: "ja", label: "Japanese" },
  ] as const;

  const [from, setFrom] = useState<(typeof languages)[number]>(languages[0]);
  const [to, setTo] = useState<(typeof languages)[number]>(languages[1]);
  const [preserveTone, setPreserveTone] = useState(true);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/75">Dubbing pipeline</div>
        <Badge className="bg-white/10 text-white border border-white/10">Studio-grade</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[11px] text-white/55">From</div>
          <div className="mt-2 grid gap-2">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setFrom(l)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-xs transition text-left",
                  from.id === l.id ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[11px] text-white/55">To</div>
          <div className="mt-2 grid gap-2">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setTo(l)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-xs transition text-left",
                  to.id === l.id ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/70">Preserve tone</div>
            <div className="text-[11px] text-white/45">Keeps pacing, emotion, and emphasis.</div>
          </div>
          <button
            onClick={() => setPreserveTone((v) => !v)}
            className={cn(
              "h-9 rounded-xl border px-3 text-xs transition",
              preserveTone ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/5 text-white/75"
            )}
          >
            {preserveTone ? "On" : "Off"}
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-white/55">Output</div>
            <div className="text-[11px] text-white/45">{from.label} → {to.label}</div>
          </div>
          <div className="mt-2 flex items-end justify-center">
            <BarVizDemo state="speaking" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Voice Remix Demo
function VoiceRemixDemo() {
  const knobs = [
    { id: "age", label: "Age", v: 0.35 },
    { id: "gender", label: "Gender", v: 0.6 },
    { id: "energy", label: "Energy", v: 0.72 },
    { id: "warmth", label: "Warmth", v: 0.55 },
  ] as const;

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(knobs.map((k) => [k.id, k.v]))
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/75">Voice changer / remix</div>
        <Badge className="bg-white/10 text-white border border-white/10">Non-destructive</Badge>
      </div>

      <div className="grid gap-2">
        {knobs.map((k) => {
          const v = values[k.id] ?? 0.5;
          return (
            <div key={k.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/70">{k.label}</div>
                <div className="text-xs text-white/45">{Math.round(v * 100)}%</div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.25))" }}
                  animate={{ width: `${Math.max(6, Math.round(v * 100))}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setValues((cur) => ({ ...cur, [k.id]: Math.max(0, (cur[k.id] ?? 0.5) - 0.08) }))}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                >
                  −
                </button>
                <button
                  onClick={() => setValues((cur) => ({ ...cur, [k.id]: Math.min(1, (cur[k.id] ?? 0.5) + 0.08) }))}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-white/55">Preview</div>
          <div className="text-[11px] text-white/45">A/B ready</div>
        </div>
        <div className="mt-2 flex items-end justify-center">
          <BarVizDemo state="speaking" />
        </div>
      </div>
    </div>
  );
}

// Voice Cloning Demo
function VoiceCloningDemo() {
  const [step, setStep] = useState<"upload" | "train" | "ready">("upload");
  const [consent, setConsent] = useState(false);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/75">Voice cloning</div>
        <Badge className="bg-white/10 text-white border border-white/10">Consent-first</Badge>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="text-[11px] text-white/55">Workflow</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["upload", "train", "ready"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs transition capitalize",
                s === step ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-3">
          {step === "upload" ? (
            <div>
              <div className="text-xs text-white/70">Upload samples</div>
              <div className="mt-1 text-[11px] text-white/45">3–5 minutes of clean speech for best results.</div>
            </div>
          ) : step === "train" ? (
            <div>
              <div className="text-xs text-white/70">Train model</div>
              <div className="mt-1 text-[11px] text-white/45">Quality checks + similarity tuning.</div>
            </div>
          ) : (
            <div>
              <div className="text-xs text-white/70">Ready to use</div>
              <div className="mt-1 text-[11px] text-white/45">Generate speech that matches the target voice.</div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/70">Verified consent</div>
            <div className="text-[11px] text-white/45">Require permission and usage controls.</div>
          </div>
          <button
            onClick={() => setConsent((v) => !v)}
            className={cn(
              "h-9 rounded-xl border px-3 text-xs transition",
              consent ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/5 text-white/75"
            )}
          >
            {consent ? "Verified" : "Not verified"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-white/55">Similarity preview</div>
          <div className="text-[11px] text-white/45">92% match</div>
        </div>
        <div className="mt-2">
          <SparkLine values={Array.from({ length: 34 }).map((_, i) => 0.25 + Math.sin(i * 0.45) * 0.18 + 0.15)} />
        </div>
      </div>
    </div>
  );
}

// Use Case Card Component with alternating full-width layout
function UseCaseCard({
  icon,
  title,
  desc,
  points,
  demo,
  demoPosition = "left",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  points: string[];
  demo: React.ReactNode;
  demoPosition?: "left" | "right";
}) {
  const DemoSection = (
    <div className="relative">
      <div className="absolute -inset-8 rounded-3xl" style={{ background: "var(--gradient-glow)", opacity: 0.7 }} />
      <div className="relative rounded-3xl border border-white/10 bg-black/40 p-5 tenlabs-noise backdrop-blur-sm">
        {demo}
      </div>
    </div>
  );

  const ContentSection = (
    <div className={cn(
      "flex flex-col justify-center",
      demoPosition === "left" ? "md:pl-8 lg:pl-16" : "md:pr-8 lg:pr-16"
    )}>
      {/* Icon and title */}
      <div className="flex items-start gap-4 mb-6">
        <div className="size-14 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 grid place-items-center text-white shadow-lg shadow-white/5 shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Feature</div>
          <h3
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ 
              fontFamily: "Plus Jakarta Sans, var(--font-sans)",
              background: "linear-gradient(135deg, #ffffff 0%, #ffffff 60%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Description with texture */}
      <p 
        className="text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.55) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {desc}
      </p>

      {/* Feature points */}
      <div className="grid gap-3 mb-8 max-w-md">
        {points.map((p) => (
          <div key={p} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white/75 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-200">
            <div className="size-5 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-400/10 grid place-items-center shrink-0 mt-0.5">
              <Check className="size-3 text-emerald-400" strokeWidth={3} />
            </div>
            <span>{p}</span>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Link href={`/products/${title.toLowerCase().replace(/\s+/g, "-")}`}>
          <Button className="bg-white text-black hover:bg-white/90 font-semibold px-6">
            Explore {title}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
        <Link href="/docs">
          <Button variant="secondary" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white/90">
            Read docs
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 md:gap-0 md:grid-cols-2 md:items-center">
      {demoPosition === "left" ? (
        <>
          {DemoSection}
          {ContentSection}
        </>
      ) : (
        <>
          {ContentSection}
          {DemoSection}
        </>
      )}
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  desc,
  items,
  highlight,
}: {
  name: string;
  price: string;
  desc: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <Card className={cn("h-full border-white/10 tenlabs-ring tenlabs-glass", highlight ? "bg-white/[0.06]" : "bg-white/[0.04]")}>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-base font-semibold text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            {name}
          </div>
          {highlight && <Badge className="bg-white text-black">Most popular</Badge>}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-4xl font-semibold tracking-tight text-white">{price}</div>
          <div className="text-sm text-white/50">/mo</div>
        </div>
        <p className="mt-2 text-sm text-white/65">{desc}</p>
        <Separator className="my-5 bg-white/10" />
        <ul className="space-y-2.5 text-sm text-white/70">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 text-white/85" strokeWidth={2.4} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
        <SignedOut>
          <Link href="/sign-up">
            <Button
              className={cn("mt-6 w-full", highlight ? "bg-white text-black hover:bg-white/90" : "bg-white/8 text-white hover:bg-white/10 border border-white/10")}
              variant={highlight ? "default" : "secondary"}
            >
              Choose {name}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard/billing">
            <Button
              className={cn("mt-6 w-full", highlight ? "bg-white text-black hover:bg-white/90" : "bg-white/8 text-white hover:bg-white/10 border border-white/10")}
              variant={highlight ? "default" : "secondary"}
            >
              Choose {name}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </SignedIn>
      </div>
    </Card>
  );
}

// FAQ Item Component
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-white/10 bg-white/[0.03] hover:bg-white/[0.04] transition tenlabs-ring">
      <button className="w-full text-left p-5 flex items-start justify-between gap-4" onClick={() => setOpen((v) => !v)}>
        <div>
          <div className="text-base font-medium text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
            {q}
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="mt-2 text-sm text-white/65"
              >
                {a}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div
          className={cn(
            "shrink-0 size-9 rounded-lg border border-white/10 bg-white/5 grid place-items-center text-white/70 transition",
            open ? "bg-white/10 text-white" : "hover:bg-white/10"
          )}
        >
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.25V12.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M3.25 8H12.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </button>
    </Card>
  );
}

// Section Heading Component
function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
        <Sparkles className="size-3.5" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-balance text-3xl md:text-4xl font-semibold tracking-tight text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
        {title}
      </h2>
      <p className="mt-3 text-base text-white/65">{desc}</p>
    </div>
  );
}

// Fallback blog posts for homepage
const fallbackBlogPosts: BlogPost[] = [
  {
    _id: "series-d",
    slug: "series-d",
    category: "Company",
    title: "TenLabs raises $500M Series D at $11B valuation",
    description: "Transforming how we interact with technology",
    content: "",
    author: "Team TenLabs",
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
    description: "Ten v3 is now out of Alpha.",
    content: "",
    author: "Joe Reeve",
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
];

function formatBlogDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Blog Post Card for Homepage
function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/company/blog/${post.slug}`}>
      <Card className="group h-full border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition tenlabs-ring overflow-hidden">
        <div className="relative h-[160px] bg-gradient-to-br from-white/5 to-white/0 grid place-items-center">
          {post.coverImage ? (
            <BlogImage
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="text-lg font-semibold text-white/20"
              style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
            >
              {post.category}
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
              {post.category}
            </span>
          </div>
          <div className="absolute top-3 right-3 size-7 rounded-full bg-white/10 border border-white/10 grid place-items-center opacity-0 group-hover:opacity-100 transition">
            <ArrowUpRight className="size-3.5 text-white/70" />
          </div>
        </div>
        <div className="p-5">
          <div
            className="text-base font-medium tracking-tight text-white line-clamp-2"
            style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
          >
            {post.title}
          </div>
          <div className="mt-2 text-sm text-white/50 line-clamp-2">{post.description}</div>
          <div className="mt-4 flex items-center gap-3 text-xs text-white/40">
            <span>{formatBlogDate(post.createdAt)}</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>{post.author}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Latest Posts Section Component
function LatestPostsSection() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackBlogPosts);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      }
    }
    fetchLatestPosts();
  }, []);

  return (
    <section id="latest-posts" className="relative py-16 md:py-22">
      <div className="absolute inset-0" style={{ background: "#0a0a0a" }} />
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionHeading
            eyebrow="Blog"
            title="Latest Posts"
            desc="Stay up to date with the latest news, product updates, and stories from the TenLabs team."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post._id} delay={i * 0.06}>
              <BlogPostCard post={post} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.18}>
          <div className="mt-10 text-center">
            <Link href="/company/blog">
              <Button
                variant="secondary"
                className="h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-6"
              >
                View all posts
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Main Landing Page
export default function TenLabsLanding() {
  const agent = useInMemoryDemoState();
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 tenlabs-grid opacity-[0.18] hidden md:block" />
          <div
            className="absolute -top-56 left-1/2 h-[640px] w-[820px] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), rgba(255,255,255,0.00) 65%)", filter: "blur(10px)" }}
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-16 md:pt-22 pb-16">
            <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <Command className="size-3.5" />
                    <span>Next-gen AI voice & audio</span>
                  </div>
                </Reveal>

                <Reveal delay={0.05}>
                  <h1
                    className="mt-5 text-balance text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
                    style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                  >
                    Build premium voice experiences — from realtime agents to studio-grade production.
                  </h1>
                </Reveal>

                <Reveal delay={0.1}>
                  <p className="mt-5 max-w-xl text-base md:text-lg text-white/65">
                    TenLabs.ai gives teams a single platform for lifelike speech, expressive voices, and audio workflows —
                    with components designed to feel fast, polished, and alive.
                  </p>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <SignedOut>
                      <Link href="/sign-up">
                        <Button className="h-11 bg-white text-black hover:bg-white/90">
                          Start free
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard">
                        <Button className="h-11 bg-white text-black hover:bg-white/90">
                          Go to Dashboard
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    </SignedIn>
                    <Link href="/creative-platform">
                      <Button variant="secondary" className="h-11 bg-white/5 hover:bg-white/10 border border-white/10">
                        <Play className="mr-2 size-4" />
                        Watch demo
                      </Button>
                    </Link>
                  </div>
                </Reveal>

                <Reveal delay={0.22}>
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: <Zap className="size-4" />, t: "Realtime", d: "Low-latency pipelines" },
                      { icon: <Shield className="size-4" />, t: "Secure", d: "Enterprise-ready" },
                      { icon: <Globe className="size-4" />, t: "Global", d: "Multi-region delivery" },
                    ].map((m) => (
                      <Card key={m.t} className="border-white/10 bg-white/[0.03] tenlabs-ring">
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-white/85">
                            {m.icon}
                            <div className="text-sm font-medium" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                              {m.t}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-white/55">{m.d}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={reduce ? 0 : 0.1}>
                <div className="relative">
                  <OrbDemo state={agent} />

                  <div className="mt-6 grid gap-3">
                    <Card className="border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-white/55">Live signal</div>
                          <Badge className="bg-white/10 text-white border border-white/10">{agent}</Badge>
                        </div>
                        <div className="mt-3">
                          <BarVizDemo state={agent} />
                        </div>
                      </div>
                    </Card>

                    <Card className="border-white/10 bg-white/[0.03] tenlabs-ring">
                      <div className="p-4 grid grid-cols-3 gap-3">
                        {[
                          { k: "Latency", v: "180ms" },
                          { k: "Voices", v: "120+" },
                          { k: "Uptime", v: "99.99%" },
                        ].map((s) => (
                          <div key={s.k}>
                            <div className="text-xs text-white/55">{s.k}</div>
                            <div className="mt-1 text-sm font-medium text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                              {s.v}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-16 md:py-22">
          <div className="absolute inset-0" style={{ background: "#0a0a0a" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHeading
                eyebrow="Designed for premium audio"
                title="A platform that feels crafted — not assembled"
                desc="ElevenLabs-grade visual polish, premium motion, and UI components that communicate state and sound."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { icon: <Cpu className="size-5" />, title: "Realtime agents", desc: "Build listening / thinking / speaking loops with UI that visually signals intent." },
                { icon: <Mic className="size-5" />, title: "Studio workflows", desc: "Preview, scrub, and compare voice variants with delightful micro-interactions." },
                { icon: <Waves className="size-5" />, title: "Audio intelligence", desc: "Visualize waveforms and frequency energy so users trust what they hear." },
              ].map((f, i) => (
                <Reveal key={f.title} delay={0.05 * i}>
                  <Card className="border-white/10 bg-white/[0.03] hover:bg-white/[0.045] transition tenlabs-ring">
                    <div className="p-6">
                      <div className="size-11 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white">
                        {f.icon}
                      </div>
                      <div className="mt-4 text-lg font-semibold text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        {f.title}
                      </div>
                      <div className="mt-2 text-sm text-white/65">{f.desc}</div>
                      <div className="mt-5 h-px bg-white/10" />
                      <div className="mt-4 text-xs text-white/55">Built with composable UI blocks for fast iteration.</div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="relative py-20 md:py-28">
          <div className="absolute inset-0" style={{ background: "#0a0a0a" }} />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% -10%, rgba(255,255,255,0.12), transparent 55%)" }}
          />
          <div className="relative mx-auto max-w-6xl px-4 mb-16">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto">
                <div className="text-xs text-white/45 uppercase tracking-widest">Use cases</div>
                <h2
                  className="mt-4 text-3xl md:text-5xl font-medium tracking-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}
                >
                  Voice workflows that ship
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-white/65">
                  Interactive demos for each use case — ready for product landing pages.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="relative mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
            <div className="grid gap-24 md:gap-32">
              {/* TTS: Demo LEFT, Content RIGHT */}
              <Reveal>
                <UseCaseCard
                  icon={<Wand2 className="size-6" />}
                  title="Text to Speech"
                  desc="Transform any script into natural, expressive speech. Our advanced AI captures nuance, emotion, and pacing — delivering audio that feels genuinely human."
                  points={[
                    "Multiple voice presets with consistent timbre",
                    "Style controls for emotion and cadence",
                    "Preview waveform + export settings",
                  ]}
                  demo={<TextToSpeechDemo />}
                  demoPosition="left"
                />
              </Reveal>

              {/* Dubbing: Demo RIGHT, Content LEFT */}
              <Reveal delay={0.06}>
                <UseCaseCard
                  icon={<Languages className="size-6" />}
                  title="Dubbing"
                  desc="Break language barriers while keeping the soul of your content. Our dubbing preserves speaker identity, tone, and emotional delivery across 30+ languages."
                  points={[
                    "Language mapping with studio-ready outputs",
                    "Tone preservation toggle for alignment",
                    "Preview energy to confirm delivery",
                  ]}
                  demo={<DubbingDemo />}
                  demoPosition="right"
                />
              </Reveal>

              {/* Voice Changer: Demo LEFT, Content RIGHT */}
              <Reveal delay={0.12}>
                <UseCaseCard
                  icon={<Waves className="size-6" />}
                  title="Voice Changer"
                  desc="Reshape voices without losing character. From subtle tweaks to dramatic transformations, maintain clarity while exploring unlimited vocal possibilities."
                  points={[
                    "Knob-based remixing for fast A/B",
                    "Keep intelligibility while shifting character",
                    "Preview-ready blocks for product UX",
                  ]}
                  demo={<VoiceRemixDemo />}
                  demoPosition="left"
                />
              </Reveal>

              {/* Voice Cloning: Demo RIGHT, Content LEFT */}
              <Reveal delay={0.18}>
                <UseCaseCard
                  icon={<CopyPlus className="size-6" />}
                  title="Voice Cloning"
                  desc="Create authentic digital twins of any voice with consent-first workflows. Our ethical approach ensures quality, trust, and full creator control."
                  points={[
                    "Simple upload → train → ready steps",
                    "Verified consent + usage controls",
                    "Similarity preview to build trust",
                  ]}
                  demo={<VoiceCloningDemo />}
                  demoPosition="right"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="relative py-16 md:py-22">
          <div className="absolute inset-0 bg-black" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.10), transparent 55%)" }}
          />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHeading
                eyebrow="Team"
                title="Built by people who obsess over audio UX"
                desc="A small team, fast iteration, and a design-first approach to voice products."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { name: "Ava Chen", role: "Product Design", bio: "Owns the interaction system and motion language — making state and sound feel tangible." },
                { name: "Noah Rivera", role: "Audio ML", bio: "Focuses on voice consistency, safety, and evaluation — so the product earns trust." },
                { name: "Mina Patel", role: "Engineering", bio: "Builds realtime pipelines and component primitives that keep demos feeling instant." },
              ].map((m, i) => (
                <Reveal key={m.name} delay={0.05 * i}>
                  <Card className="border-white/10 bg-white/[0.03] hover:bg-white/[0.045] transition tenlabs-ring">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-white">
                            <UserRound className="size-5" />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                              {m.name}
                            </div>
                            <div className="text-sm text-white/55">{m.role}</div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-white/65">{m.bio}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.18}>
              <div className="mt-10">
                <Card className="border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass">
                  <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                      <div className="text-lg font-semibold text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        We&apos;re hiring builders who care about craft
                      </div>
                      <div className="mt-2 text-sm text-white/65">If you want to ship premium voice UX, we&apos;d love to talk.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/company/careers">
                        <Button variant="secondary" className="bg-white/5 hover:bg-white/10 border border-white/10">
                          View roles
                        </Button>
                      </Link>
                      <Link href="/company/about">
                        <Button className="bg-white text-black hover:bg-white/90">
                          Contact
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-16 md:py-22">
          <div className="absolute inset-0" style={{ background: "#0a0a0a" }} />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHeading
                eyebrow="Pricing"
                title="Transparent plans for teams"
                desc="Start fast with a self-serve plan — then scale into security, SLAs, and custom voice pipelines."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Reveal>
                <PricingCard name="Starter" price="$29" desc="For prototypes and early products." items={["20k characters", "Basic voices", "Audio exports", "Community support"]} />
              </Reveal>
              <Reveal delay={0.06}>
                <PricingCard name="Pro" price="$99" desc="For teams shipping premium audio UX." items={["250k characters", "Advanced voices", "Realtime agent UI", "Priority support"]} highlight />
              </Reveal>
              <Reveal delay={0.12}>
                <PricingCard name="Enterprise" price="$499" desc="Security, SLAs, and custom integrations." items={["Unlimited projects", "SSO/SAML", "Dedicated region", "Custom contracts"]} />
              </Reveal>
            </div>

            <Reveal delay={0.18}>
              <div className="mt-10">
                <Card className="border-white/10 bg-white/[0.03] tenlabs-ring">
                  <div className="p-6 md:p-7 grid gap-6 md:grid-cols-[1fr_0.9fr] md:items-center">
                    <div>
                      <div className="text-xl font-semibold text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        Get the launch notes
                      </div>
                      <div className="mt-2 text-sm text-white/65">
                        Product updates, release drops, and new voices — in a low-noise email.
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input placeholder="Email address" className="h-11 bg-black/30 border-white/10 focus-visible:ring-white/20" />
                      <Button className="h-11 bg-white text-black hover:bg-white/90">Subscribe</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Latest Posts Section */}
        <LatestPostsSection />

        {/* FAQ Section */}
        <section id="faq" className="relative py-16 md:py-22">
          <div className="absolute inset-0 bg-black" />
          <div className="relative mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHeading
                eyebrow="FAQ"
                title="Answers, upfront"
                desc="Everything you need to know to evaluate TenLabs.ai for premium voice products."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                { q: "What is TenLabs?", a: "TenLabs is a premium AI voice platform for building lifelike speech experiences, from realtime agents to studio-grade production." },
                { q: "How do I get started?", a: "Sign up for a free account and start generating speech immediately. No credit card required." },
                { q: "Does it work on mobile?", a: "Yes. The layout uses responsive grids, touch-friendly controls, and reduced-motion support." },
                { q: "Can I use this for commercial projects?", a: "Yes, all generated audio can be used commercially according to your plan terms." },
              ].map((f) => (
                <Reveal key={f.q}>
                  <FAQItem q={f.q} a={f.a} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <div className="mt-12">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] tenlabs-ring tenlabs-glass overflow-hidden shadow-[0_30px_140px_rgba(0,0,0,0.80)]">
                  <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="text-lg font-semibold text-white" style={{ fontFamily: "Plus Jakarta Sans, var(--font-sans)" }}>
                        TenLabs.ai
                      </div>
                      <div className="mt-2 text-sm text-white/65">Premium voice UX, designed to feel alive.</div>
                      <div className="mt-3 text-xs text-white/45">© {new Date().getFullYear()} TenLabs.ai. All rights reserved.</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <Link href="/pricing">
                        <Button variant="secondary" className="h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-5">
                          Contact sales
                        </Button>
                      </Link>
                      <SignedOut>
                        <Link href="/sign-up">
                          <Button className="h-11 rounded-full bg-white text-black hover:bg-white/90 px-5">
                            Start free
                            <ArrowRight className="ml-2 size-4" />
                          </Button>
                        </Link>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard">
                          <Button className="h-11 rounded-full bg-white text-black hover:bg-white/90 px-5">
                            Dashboard
                            <ArrowRight className="ml-2 size-4" />
                          </Button>
                        </Link>
                      </SignedIn>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
