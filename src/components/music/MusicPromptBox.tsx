"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, Music2, Gem, ArrowUp, Loader2, Play, Pause, Download } from "lucide-react";

const PLACEHOLDER =
  "Compose an emotional orchestral piece with expressive strings, gentle woodwinds, and a slow, cinematic build-up.";

const DURATION_OPTIONS = [
  { label: "Auto", value: 0 },
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "1 min", value: 60000 },
  { label: "2 min", value: 120000 },
  { label: "5 min", value: 300000 },
];

export function MusicPromptBox() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [forceInstrumental, setForceInstrumental] = useState(false);
  const [provider, setProvider] = useState<"elevenlabs" | "minimax">("elevenlabs");
  const [activeTab, setActiveTab] = useState<"prompt" | "lyrics">("prompt");
  const [lyrics, setLyrics] = useState("");


  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isEmpty = prompt.trim().length === 0;

  const handleGenerate = async () => {
    if (isEmpty || loading) return;

    // Minimax: lyrics optional - auto-generated via Lyrics API when empty

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const body: Record<string, unknown> = { prompt: prompt.trim(), provider };
      if (provider === "elevenlabs") {
        body.forceInstrumental = forceInstrumental;
        if (durationMs > 0) body.durationMs = durationMs;
      }
      if (provider === "minimax" && lyrics.trim().length > 0) {
        body.lyrics = lyrics.trim();
      }

      const res = await fetch("/api/music/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      const json = await res.json();
      if (!json.success || !json.data?.audioUrl) {
        throw new Error("Invalid response from server");
      }

      setAudioUrl(json.data.audioUrl);

      if (json.data?.generationId) {
        try {
          sessionStorage.setItem(
            `music_generation_${json.data.generationId}`,
            JSON.stringify({
              id: json.data.generationId,
              prompt: prompt.trim(),
              lyrics: provider === "minimax" ? (json.data.lyrics ?? lyrics.trim()) : undefined,
              audioUrl: json.data.audioUrl,
              durationMs: json.data.durationMs ?? durationMs,
              provider,
              createdAt: new Date().toISOString(),
            })
          );
        } catch {
          // sessionStorage may be unavailable
        }
        router.push(`/music/${json.data.generationId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate music");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedDuration = DURATION_OPTIONS.find((d) => d.value === durationMs);

  return (
    <div className="w-full max-w-[680px] mx-auto space-y-3">
      <div
        id="music-prompt-box"
        className="w-full rounded-xl bg-[rgba(50,50,53,0.8)] text-white"
      >
        <div className="flex flex-wrap items-center gap-1 px-5 pt-3 pb-1">
          <button
            type="button"
            onClick={() => setProvider("elevenlabs")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              provider === "elevenlabs"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            ElevenLabs
          </button>
          <button
            type="button"
            onClick={() => {
              setProvider("minimax");
              setActiveTab("prompt");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              provider === "minimax"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Minimax
          </button>
          {provider === "minimax" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("prompt")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "prompt"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Prompt
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("lyrics")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "lyrics"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Lyrics
              </button>
            </>
          )}
        </div>

        <div className="px-5 pt-1 pb-4">
          {(provider === "elevenlabs" || activeTab === "prompt") && (
            <div className="w-full min-h-[80px]">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={PLACEHOLDER}
                aria-label="Describe the music you want to create"
                disabled={loading}
                className="w-full min-h-[56px] max-h-[256px] resize-none overflow-y-auto bg-transparent text-base leading-7 text-white placeholder:text-white/35 focus:outline-none focus:ring-0 px-1.5 py-1.5 disabled:opacity-50"
                rows={3}
              />
            </div>
          )}
          {provider === "minimax" && activeTab === "lyrics" && (
            <div className="w-full min-h-[80px]">
              <label className="block text-xs text-white/50 mb-1.5 px-1.5">
                Lyrics (optional – auto-generated from prompt if empty)
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse]\nWrite your lyrics here...\n[Chorus]\nAdd chorus lyrics..."
                disabled={loading}
                className="w-full min-h-[80px] max-h-[256px] resize-none overflow-y-auto bg-transparent text-base leading-7 text-white placeholder:text-white/35 focus:outline-none focus:ring-0 px-1.5 py-1.5 disabled:opacity-50"
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
          <div className="flex items-center gap-1">
            {provider === "elevenlabs" && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Duration"
                  onClick={() => setShowDurationPicker(!showDurationPicker)}
                  className="flex items-center gap-1.5 h-8 px-1.5 py-1.5 rounded-lg text-[#a6a6ae] hover:bg-white/5 transition-colors"
                >
                  <Clock className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium tabular-nums">
                    {selectedDuration?.label ?? "Auto"}
                  </span>
                </button>
                {showDurationPicker && (
                  <div className="absolute bottom-full left-0 mb-1 bg-[#2a2a2d] border border-white/10 rounded-lg shadow-xl z-20 py-1 min-w-[100px]">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setDurationMs(opt.value);
                          setShowDurationPicker(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 transition-colors ${
                          durationMs === opt.value ? "text-white" : "text-white/60"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {provider === "elevenlabs" && (
              <button
                type="button"
                aria-label="Instrumental only"
                onClick={() => setForceInstrumental(!forceInstrumental)}
                className={`flex items-center gap-1.5 h-8 px-1.5 py-1.5 rounded-lg transition-colors ${
                  forceInstrumental ? "text-white bg-white/10" : "text-[#a6a6ae] hover:bg-white/5"
                }`}
              >
                <Music2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {forceInstrumental ? "Instrumental" : "Auto"}
                </span>
              </button>
            )}
          </div>

          <div className="relative flex h-9 flex-shrink-0 items-center overflow-hidden rounded-full bg-[rgba(243,243,255,0.086)]">
            <div className="flex items-center gap-1 px-2.5 py-2 text-[#a6a6ae]">
              <Gem className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="whitespace-nowrap text-sm font-medium">
                900 credits/min
              </span>
            </div>
            <button
              type="button"
              disabled={isEmpty || loading}
              aria-label="Generate music"
              onClick={handleGenerate}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                isEmpty || loading
                  ? "bg-[#5b5b64] text-[#242426] cursor-default"
                  : "bg-white text-black hover:bg-white/90 cursor-pointer"
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Generating music... this may take a moment</span>
        </div>
      )}

      {audioUrl && (
        <div className="p-4 bg-[rgba(50,50,53,0.8)] rounded-xl">
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition-colors flex-shrink-0"
            >
              {isPlaying ? (
                <Pause size={18} className="text-black" />
              ) : (
                <Play size={18} className="text-black ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 tabular-nums w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-white/50 tabular-nums w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            <a
              href={audioUrl}
              download="music.mp3"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <Download size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
