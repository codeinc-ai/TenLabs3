"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Grid2x2,
  Play,
  Pause,
  Download,
  Share2,
  ArrowUp,
  Loader2,
  Volume2,
  RefreshCw,
} from "lucide-react";
import MusicOrb from "@/components/music/MusicOrb";

interface GenerationData {
  id: string;
  prompt: string;
  lyrics?: string;
  audioUrl: string;
  durationMs: number;
  provider?: string;
  createdAt: string;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function generateWaveformBars(count: number, seed: number) {
  const bars: number[] = [];
  let val = seed;
  for (let i = 0; i < count; i++) {
    val = (val * 9301 + 49297) % 233280;
    bars.push(8 + (val % 40));
  }
  return bars;
}

export default function MusicStudioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;

  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioLevelRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRafRef = useRef<number | null>(null);
  const hasAutoPlayedRef = useRef(false);

  const waveformBars = useMemo(() => generateWaveformBars(120, 42), []);

  // Web Audio API: connect analyser when audio plays, drive audioLevelRef for MusicOrb
  const setupAudioAnalyser = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    analyser.minDecibels = -60;
    analyser.maxDecibels = -10;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      const decay = () => {
        audioLevelRef.current *= 0.92;
        if (audioLevelRef.current > 0.01) {
          analyserRafRef.current = requestAnimationFrame(decay);
        }
      };
      analyserRafRef.current = requestAnimationFrame(decay);
      return () => {
        if (analyserRafRef.current) {
          cancelAnimationFrame(analyserRafRef.current);
          analyserRafRef.current = null;
        }
      };
    }

    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyserRafRef.current = requestAnimationFrame(update);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length / 255;
      const level = Math.min(1, avg * 2.5);
      audioLevelRef.current = level * 0.3 + audioLevelRef.current * 0.7;
    };
    update();

    return () => {
      if (analyserRafRef.current) {
        cancelAnimationFrame(analyserRafRef.current);
        analyserRafRef.current = null;
      }
    };
  }, [isPlaying]);

  const handleFirstPlay = useCallback(() => {
    if (audioContextRef.current) return;
    setupAudioAnalyser();
    const ctx = audioContextRef.current as AudioContext | null;
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  }, [setupAudioAnalyser]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`music_generation_${id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored) as GenerationData;
        setGeneration(data);
        setLoading(false);
        return;
      } catch {
        // fall through to API fetch
      }
    }

    const fetchFromHistory = async () => {
      try {
        const res = await fetch("/api/music/history?limit=50");
        if (!res.ok) throw new Error("Failed to load generation");
        const json = await res.json();
        const found = (json.generations ?? []).find(
          (g: GenerationData) => g.id === id
        );
        if (found) {
          setGeneration(found);
        } else {
          setGeneration({
            id,
            prompt: "Music Generation",
            audioUrl: `/api/music/${id}`,
            durationMs: 0,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load generation"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFromHistory();
  }, [id]);

  // Reset auto-play flag when id changes
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [id]);

  // Auto-play when navigated from history with ?play=1
  useEffect(() => {
    if (!generation || loading || searchParams.get("play") !== "1" || hasAutoPlayedRef.current) return;
    hasAutoPlayedRef.current = true;
    const audio = audioRef.current;
    if (!audio) return;
    handleFirstPlay();
    audio.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
    // Remove ?play=1 from URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.delete("play");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [generation, loading, searchParams, handleFirstPlay]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      handleFirstPlay();
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [isPlaying, handleFirstPlay]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audioRef.current.currentTime = pct * duration;
    },
    [duration]
  );

  const handleWaveformClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audioRef.current.currentTime = pct * duration;
    },
    [duration]
  );

  const handleRegenerate = async () => {
    if (!prompt.trim() || regenerating) return;
    setRegenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/music/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      const json = await res.json();
      if (!json.success || !json.data?.generationId) {
        throw new Error("Invalid response from server");
      }

      const newGen: GenerationData = {
        id: json.data.generationId,
        prompt: prompt.trim(),
        audioUrl: json.data.audioUrl,
        durationMs: json.data.durationMs ?? 0,
        lyrics: json.data.lyrics,
        provider: "elevenlabs",
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem(
        `music_generation_${newGen.id}`,
        JSON.stringify(newGen)
      );
      router.push(`/music/${newGen.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to regenerate music"
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generation) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard not available
    }
  };

  const parsedLyrics = useMemo(() => {
    if (!generation?.lyrics) return null;
    return generation.lyrics.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return { type: "blank" as const, text: "", key: i };
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        return {
          type: "section" as const,
          text: trimmed.slice(1, -1),
          key: i,
        };
      }
      return { type: "lyric" as const, text: trimmed, key: i };
    });
  }, [generation?.lyrics]);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error && !generation) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
        <p className="text-sm text-red-400">{error}</p>
        <Link
          href="/music"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
        >
          Back to Music
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#0a0a0a] text-white">
      <audio
        ref={audioRef}
        src={generation?.audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Header */}
      <header className="flex h-[52px] w-full shrink-0 items-center justify-between border-b border-[#1a1a1a] bg-[#0d0d0d] px-4">
        <Link
          href="/music"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-medium text-white">
          {generation?.prompt
            ? generation.prompt.slice(0, 30) +
              (generation.prompt.length > 30 ? "..." : "")
            : "Music Generation"}
        </h1>
        <Link
          href="/music/history"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <Grid2x2 className="h-4 w-4" />
          Generations
        </Link>
      </header>

      {/* Scrollable main content with sticky bar inside */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 pb-4">
          <div className="mx-auto max-w-[680px] space-y-8">
            {/* Style tags */}
            {generation?.provider && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#1a1a1a] px-3 py-1 text-xs font-medium text-white/70">
                  {generation.provider}
                </span>
                {generation.durationMs > 0 && (
                  <span className="rounded-full bg-[#1a1a1a] px-3 py-1 text-xs font-medium text-white/70">
                    {formatTime(generation.durationMs / 1000)}
                  </span>
                )}
              </div>
            )}

            {/* Audio-reactive orb - animates with music */}
            <div className="relative -mx-4 aspect-[16/9] max-h-[280px] overflow-hidden rounded-xl bg-[#0a0a0a] sm:mx-0 sm:rounded-2xl">
              <MusicOrb
                audioLevelRef={audioLevelRef}
                hue={280}
                hoverIntensity={2}
                rotateOnHover={true}
                backgroundColor="#0a0a0a"
              />
            </div>

            {/* Lyrics display */}
            <div className="space-y-4">
              {parsedLyrics ? (
                parsedLyrics.map((line) => {
                  if (line.type === "blank") {
                    return <div key={line.key} className="h-3" />;
                  }
                  if (line.type === "section") {
                    return (
                      <h3
                        key={line.key}
                        className="text-sm font-bold uppercase tracking-widest text-white/40"
                      >
                        {line.text}
                      </h3>
                    );
                  }
                  return (
                    <p
                      key={line.key}
                      className="text-[15px] leading-7 text-white/80"
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="rounded-xl bg-[#111] p-6">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/30">
                    Prompt
                  </p>
                  <p className="text-[15px] leading-7 text-white/70">
                    {generation?.prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Generation info */}
            {generation?.createdAt && (
              <p className="text-xs text-white/30">
                Generated{" "}
                {new Date(generation.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Sticky bar: prompt + audio + waveform - always visible at bottom */}
        <div className="sticky bottom-0 z-20 mt-auto border-t border-[#1a1a1a]">
          {/* Prompt input for regeneration */}
          <div className="px-4 py-3">
            <div className="mx-auto flex max-w-[680px] items-end gap-2">
              <div className="flex-1 rounded-xl bg-[#1a1a1a] px-4 py-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe a new variation..."
                  disabled={regenerating}
                  rows={1}
                  className="w-full resize-none bg-transparent text-sm leading-6 text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleRegenerate();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleRegenerate}
                disabled={!prompt.trim() || regenerating}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90 disabled:cursor-default disabled:bg-[#5b5b64] disabled:text-[#242426]"
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="mx-auto mt-2 max-w-[680px] text-xs text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Audio player bar */}
          <div className="border-t border-[#1a1a1a] px-4 py-3">
            <div className="mx-auto flex max-w-[960px] items-center gap-4">
          <button
            onClick={togglePlayPause}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-colors hover:bg-white/90"
          >
            {isPlaying ? (
              <Pause size={18} className="text-black" />
            ) : (
              <Play size={18} className="ml-0.5 text-black" />
            )}
          </button>

          <span className="w-10 text-right text-xs tabular-nums text-white/50">
            {formatTime(currentTime)}
          </span>

          <div
            className="flex-1 cursor-pointer"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Audio progress"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemax={Math.round(duration)}
            tabIndex={0}
          >
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-[width]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <span className="w-10 text-xs tabular-nums text-white/50">
            {formatTime(duration)}
          </span>

          <div className="flex items-center gap-1">
            <Volume2 className="h-4 w-4 text-white/40" />
            <a
              href={generation?.audioUrl}
              download={`music-${id}.mp3`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Download size={16} />
            </a>
            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Share2 size={16} />
            </button>
            <Link
              href={`/music/${id}`}
              onClick={(e) => {
                e.preventDefault();
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(() => {});
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RefreshCw size={14} />
            </Link>
          </div>
            </div>
          </div>

          {/* Waveform timeline */}
          <div className="border-t border-[#1a1a1a] px-4 py-2">
            <div className="mx-auto max-w-[960px]">
          <div
            ref={waveformRef}
            className="relative flex h-12 w-full cursor-pointer items-end gap-[2px]"
            onClick={handleWaveformClick}
            role="slider"
            aria-label="Waveform timeline"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemax={Math.round(duration)}
            tabIndex={0}
          >
            {waveformBars.map((height, i) => {
              const barPct = (i / waveformBars.length) * 100;
              const isPlayed = barPct < progressPct;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-colors ${
                    isPlayed ? "bg-white/60" : "bg-[#2a2a2a]"
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-white/25">
            <span>0:00</span>
            <span>{duration > 0 ? formatTime(duration / 4) : ""}</span>
            <span>{duration > 0 ? formatTime(duration / 2) : ""}</span>
            <span>{duration > 0 ? formatTime((duration * 3) / 4) : ""}</span>
            <span>{formatTime(duration)}</span>
          </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
