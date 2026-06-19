"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  /** Audio source URL */
  src: string;
  /** Track title (for the download filename) */
  title?: string;
  /** Auto-play as soon as the audio is ready */
  autoPlay?: boolean;
  /** Allow downloading the track. Default true. */
  downloadable?: boolean;
  className?: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Lightweight, performant audio player for music.
 *
 * Unlike the heavy `Speaker` component, this does NOT pre-download and decode
 * the whole file or build a WebAudio graph. It relies on the browser's native
 * streaming `<audio>` element and updates the progress bar via direct DOM refs
 * (instead of React state) so playback never causes per-frame re-renders.
 */
export function MusicPlayer({
  src,
  title = "music",
  autoPlay = false,
  downloadable = true,
  className,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const currentLabelRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);

  // Update the progress fill + time label directly on the DOM (no re-render).
  const syncProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
      if (currentLabelRef.current)
        currentLabelRef.current.textContent = formatTime(audio.currentTime);
    }
  }, []);

  const startRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const loop = () => {
      syncProgress();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [syncProgress]);

  const stopRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    syncProgress();
  }, [syncProgress]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Reset transient UI when the source changes.
  useEffect(() => {
    setLoading(true);
    setDuration(0);
    setIsPlaying(false);
    if (fillRef.current) fillRef.current.style.width = "0%";
    if (currentLabelRef.current) currentLabelRef.current.textContent = "0:00";
  }, [src]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    // Reflect immediately even when paused.
    if (fillRef.current) fillRef.current.style.width = `${ratio * 100}%`;
    if (currentLabelRef.current)
      currentLabelRef.current.textContent = formatTime(audio.currentTime);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.04]",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        autoPlay={autoPlay}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onPlay={() => {
          setIsPlaying(true);
          startRaf();
        }}
        onPause={() => {
          setIsPlaying(false);
          stopRaf();
        }}
        onEnded={() => {
          setIsPlaying(false);
          stopRaf();
          if (fillRef.current) fillRef.current.style.width = "0%";
        }}
      />

      {/* Play / pause */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        {loading && !isPlaying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" />
        )}
      </button>

      {/* Progress + time */}
      <div className="flex flex-1 items-center gap-2">
        <span
          ref={currentLabelRef}
          className="w-10 text-right text-xs tabular-nums text-black/50 dark:text-white/50"
        >
          0:00
        </span>
        <div
          onClick={handleSeek}
          className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-black/10 dark:bg-white/10"
        >
          <div
            ref={fillRef}
            className="absolute left-0 top-0 h-full rounded-full bg-black dark:bg-white"
            style={{ width: "0%" }}
          />
        </div>
        <span className="w-10 text-xs tabular-nums text-black/50 dark:text-white/50">
          {formatTime(duration)}
        </span>
      </div>

      {/* Download */}
      {downloadable && (
        <a
          href={src}
          download={`${title}.mp3`}
          aria-label="Download track"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-black/50 transition-colors hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Download className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
