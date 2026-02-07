"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Play, Download, Clock } from "lucide-react";

interface MusicGeneration {
  id: string;
  prompt: string;
  audioUrl: string;
  durationMs: number;
  createdAt: string;
}

export default function MusicHistoryPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handlePlay = (gen: MusicGeneration) => {
    router.push(`/music/${gen.id}?play=1`);
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full pt-8 px-5 text-white">
      <header className="flex flex-col w-full max-w-[1152px] mx-auto mb-4 pb-4 border-b border-white/10">
        <div className="w-full pb-4">
          <div className="flex flex-row min-h-9 w-full items-center justify-between">
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.15px] text-white">
              Music
            </h1>
          </div>
        </div>
        <div className="flex flex-row -mt-2 w-full items-center justify-between">
          <nav className="inline-flex h-11 w-full gap-1.5 overflow-x-auto overflow-y-visible pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/music"
              className="relative flex items-center justify-center text-sm font-medium text-white/50 border-b-2 border-transparent pb-2.5 px-0 transition-all hover:text-white/70"
            >
              <span className="flex items-center rounded-lg border border-transparent px-2.5 py-1">
                Explore
              </span>
            </Link>
            <Link
              href="/music/history"
              className="relative flex items-center justify-center text-sm font-medium text-white border-b-2 border-white/90 pb-2.5 px-0 transition-all"
            >
              <span className="flex items-center rounded-lg border border-[#323235] px-2.5 py-1">
                History
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex-1 w-full max-w-[1152px] mx-auto pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Clock size={40} className="text-white/20 mb-4" />
            <p className="text-lg text-white/70 mb-2">No music generations yet</p>
            <p className="text-sm text-white/50 mb-6">
              Your generated music will appear here.
            </p>
            <Link
              href="/music"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              Explore Music
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <button
                  onClick={() => handlePlay(gen)}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <Play size={16} className="text-white ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{gen.prompt}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-white/40">
                      {formatDuration(gen.durationMs)}
                    </span>
                    <span className="text-xs text-white/40">
                      {new Date(gen.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <a
                  href={gen.audioUrl}
                  download={`music-${gen.id}.mp3`}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Download size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
