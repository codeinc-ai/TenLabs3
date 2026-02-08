"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Grid2x2,
  ArrowUp,
  Loader2,
} from "lucide-react";
import { Speaker } from "@/components/speaker";

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

export default function MusicStudioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);

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
            {/* Lyrics at top */}
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

        {/* Sticky bar: prompt + Speaker - always visible at bottom */}
        <div className="sticky bottom-0 z-20 mt-auto border-t border-[#1a1a1a] bg-[#0a0a0a]">
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

          {/* Speaker component (waveform, play/pause, volume, no orbs) */}
          {generation?.audioUrl && (
            <div className="px-4 pb-4">
              <Speaker
                track={{
                  url: generation.audioUrl,
                  title: generation.prompt || "Music Generation",
                }}
                showOrbs={false}
                className="border-[#1a1a1a] bg-[#111]"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
