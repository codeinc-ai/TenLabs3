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
import { MusicPlayer } from "@/components/music";

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
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black/40 dark:text-white/50" />
      </div>
    );
  }

  if (error && !generation) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4 text-black dark:text-white">
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        <Link
          href="/music"
          className="rounded-lg bg-black/5 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          Back to Music
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-[52px] w-full shrink-0 items-center justify-between border-b border-black/10 bg-white/80 px-4 backdrop-blur-md dark:border-white/10 dark:bg-black/60">
        <Link
          href="/music"
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-black/70 transition-colors hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="absolute left-1/2 max-w-[50%] -translate-x-1/2 truncate text-[15px] font-medium">
          {generation?.prompt
            ? generation.prompt.slice(0, 40) +
              (generation.prompt.length > 40 ? "..." : "")
            : "Music Generation"}
        </h1>
        <Link
          href="/music/history"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Grid2x2 className="h-4 w-4" />
          <span className="hidden sm:inline">Generations</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-[680px] space-y-8">
          {/* Hero / now playing card */}
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-black/40 dark:text-white/40">
              Now playing
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              {generation?.prompt || "Music Generation"}
            </h2>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {generation?.provider && (
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium capitalize text-black/70 dark:bg-white/10 dark:text-white/70">
                  {generation.provider}
                </span>
              )}
              {generation?.durationMs ? (
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/70">
                  {formatTime(generation.durationMs / 1000)}
                </span>
              ) : null}
              {generation?.createdAt && (
                <span className="text-xs text-black/40 dark:text-white/40">
                  Generated{" "}
                  {new Date(generation.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Player */}
            {generation?.audioUrl && (
              <div className="mt-5">
                <MusicPlayer
                  key={generation.audioUrl}
                  src={generation.audioUrl}
                  title={generation.prompt || "Music Generation"}
                  autoPlay
                />
              </div>
            )}
          </div>

          {/* Lyrics */}
          {parsedLyrics && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
                Lyrics
              </h3>
              {parsedLyrics.map((line) => {
                if (line.type === "blank") {
                  return <div key={line.key} className="h-2" />;
                }
                if (line.type === "section") {
                  return (
                    <h4
                      key={line.key}
                      className="pt-2 text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40"
                    >
                      {line.text}
                    </h4>
                  );
                }
                return (
                  <p
                    key={line.key}
                    className="text-[15px] leading-7 text-black/80 dark:text-white/80"
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky bar: regenerate prompt */}
      <div className="sticky bottom-0 z-20 border-t border-black/10 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex max-w-[680px] items-end gap-2">
          <div className="flex-1 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a new variation..."
              disabled={regenerating}
              rows={1}
              className="w-full resize-none bg-transparent text-sm leading-6 text-black placeholder:text-black/30 focus:outline-none disabled:opacity-50 dark:text-white dark:placeholder:text-white/30"
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/90 disabled:cursor-default disabled:bg-black/20 disabled:text-white/50 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:disabled:bg-white/20 dark:disabled:text-black/40"
          >
            {regenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="mx-auto mt-2 max-w-[680px] text-xs text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
