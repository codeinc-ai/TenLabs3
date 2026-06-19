"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, Play, Pause, Download, Clock } from "lucide-react";

interface MusicGeneration {
  id: string;
  prompt: string;
  audioUrl: string;
  durationMs: number;
  createdAt: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicHistoryPage() {
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/music/history?limit=50");
        if (!res.ok) throw new Error("Failed to load history");
        const json = await res.json();
        setGenerations(json.generations ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Stop audio when unmounting.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playTrack = useCallback((gen: MusicGeneration) => {
    const current = audioRef.current;

    // Same track → toggle instantly.
    if (currentIdRef.current === gen.id && current) {
      if (current.paused) {
        current.play().catch(() => setPlayingId(null));
        setPlayingId(gen.id);
      } else {
        current.pause();
        setPlayingId(null);
      }
      return;
    }

    if (current) current.pause();

    const audio = new Audio(gen.audioUrl || `/api/music/${gen.id}`);
    audio.preload = "auto";
    audioRef.current = audio;
    currentIdRef.current = gen.id;

    audio.addEventListener("ended", () => setPlayingId(null));
    audio.addEventListener("playing", () => setLoadingId(null));
    audio.addEventListener("error", () => {
      setLoadingId(null);
      setPlayingId(null);
    });

    setLoadingId(gen.id);
    setPlayingId(gen.id);
    audio.play().catch(() => {
      setLoadingId(null);
      setPlayingId(null);
    });
  }, []);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const nowPlaying = playingId
    ? generations.find((g) => g.id === playingId) ?? null
    : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full pt-8 px-5 text-black dark:text-white">
      <header className="flex flex-col w-full max-w-[1152px] mx-auto mb-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="w-full pb-4">
          <div className="flex flex-row min-h-9 w-full items-center justify-between">
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.15px]">
              Music
            </h1>
          </div>
        </div>
        <div className="flex flex-row -mt-2 w-full items-center justify-between">
          <nav className="inline-flex h-11 w-full gap-1.5 overflow-x-auto overflow-y-visible pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/music"
              className="relative flex items-center justify-center text-sm font-medium text-black/50 dark:text-white/50 border-b-2 border-transparent pb-2.5 px-0 transition-all hover:text-black/70 dark:hover:text-white/70"
            >
              <span className="flex items-center rounded-lg border border-transparent px-2.5 py-1">
                Explore
              </span>
            </Link>
            <Link
              href="/music/history"
              className="relative flex items-center justify-center text-sm font-medium text-black dark:text-white border-b-2 border-black/90 dark:border-white/90 pb-2.5 px-0 transition-all"
            >
              <span className="flex items-center rounded-lg border border-black/15 dark:border-[#323235] px-2.5 py-1">
                History
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex-1 w-full max-w-[1152px] mx-auto pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-black/40 dark:text-white/50" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-black/[0.06] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Clock size={40} className="text-black/20 dark:text-white/20 mb-4" />
            <p className="text-lg text-black/70 dark:text-white/70 mb-2">No music generations yet</p>
            <p className="text-sm text-black/50 dark:text-white/50 mb-6">
              Your generated music will appear here.
            </p>
            <Link
              href="/music"
              className="px-4 py-2 rounded-lg bg-black/[0.06] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white text-sm font-medium transition-colors"
            >
              Explore Music
            </Link>
          </div>
        ) : (
          <div className={`space-y-1 ${nowPlaying ? "pb-16" : ""}`}>
            {generations.map((gen) => {
              const isPlaying = playingId === gen.id;
              const isLoading = loadingId === gen.id;
              return (
                <div
                  key={gen.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors group ${
                    isPlaying
                      ? "bg-black/[0.06] dark:bg-white/10"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => playTrack(gen)}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="w-10 h-10 bg-black/[0.06] dark:bg-white/10 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="text-black dark:text-white animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={16} className="text-black dark:text-white" />
                    ) : (
                      <Play size={16} className="text-black dark:text-white ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black dark:text-white truncate">{gen.prompt}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-black/40 dark:text-white/40">
                        {formatDuration(gen.durationMs)}
                      </span>
                      <span className="text-xs text-black/40 dark:text-white/40">
                        {new Date(gen.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/music/${gen.id}`}
                    className="px-2.5 py-1.5 text-xs font-medium text-black/50 hover:text-black hover:bg-black/5 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Details
                  </Link>
                  <a
                    href={gen.audioUrl}
                    download={`music-${gen.id}.mp3`}
                    className="p-2 text-black/30 hover:text-black hover:bg-black/5 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Download size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {nowPlaying && (
        <HistoryNowPlayingBar
          track={nowPlaying}
          audioRef={audioRef}
          isPlaying={playingId === nowPlaying.id}
          onToggle={() => playTrack(nowPlaying)}
        />
      )}
    </div>
  );
}

/** Inline bottom player bar so generations play without opening a full page. */
function HistoryNowPlayingBar({
  track,
  audioRef,
  isPlaying,
  onToggle,
}: {
  track: MusicGeneration;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  onToggle: () => void;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const loop = () => {
      const audio = audioRef.current;
      if (audio && audio.duration > 0) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (fillRef.current) fillRef.current.style.width = `${pct}%`;
        if (timeRef.current) {
          timeRef.current.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, audioRef, track.id]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#111]/95">
      <div className="h-0.5 w-full bg-black/10 dark:bg-white/10">
        <div ref={fillRef} className="h-full bg-black dark:bg-white" style={{ width: "0%" }} />
      </div>
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-[1152px] mx-auto">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-colors flex-shrink-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black dark:text-white truncate">{track.prompt}</p>
          <p className="text-xs text-black/50 dark:text-white/50 truncate">Music generation</p>
        </div>
        <span
          ref={timeRef}
          className="text-xs text-black/40 dark:text-white/40 tabular-nums hidden sm:block"
        >
          0:00 / 0:00
        </span>
        <Link
          href={`/music/${track.id}`}
          className="hidden sm:flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-black/60 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          Open details
        </Link>
      </div>
    </div>
  );
}
