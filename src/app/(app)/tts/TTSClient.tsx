"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { useUser } from "@clerk/nextjs";
import {
  Book,
  Smile,
  Mic,
  Languages,
  Clapperboard,
  Gamepad2,
  Radio,
  Flower,
  RotateCcw,
  Play,
  Pause,
  Download,
  Loader2,
  Clock,
  Settings,
} from "lucide-react";

import { DEFAULT_VOICES, TTS_DEFAULTS, PLANS, ELEVENLABS_MODELS } from "@/constants";
import { MINIMAX_DEFAULT_VOICES, MINIMAX_MODELS, MINIMAX_EMOTIONS, MINIMAX_TTS_DEFAULTS } from "@/constants/minimax";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";
import { VoicePicker } from "@/components/ui/voice-picker";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import type { ProviderType } from "@/lib/providers/types";

interface TTSClientProps {
  userPlan?: "free" | "starter" | "creator" | "pro";
  currentUsage?: {
    charactersUsed: number;
    generationsUsed: number;
  };
}

type VoicePickerVoice = {
  voiceId: string;
  name: string;
  previewUrl: string | undefined;
  labels?: {
    accent?: string;
    gender?: string;
    age?: string;
    description?: string;
    "use case"?: string;
  };
};

const fallbackVoices: VoicePickerVoice[] = DEFAULT_VOICES.map((voice) => ({
  voiceId: voice.id,
  name: voice.name,
  previewUrl: undefined,
  labels: {
    description: voice.category,
    "use case": voice.category,
  },
}));

const minimaxVoices: VoicePickerVoice[] = MINIMAX_DEFAULT_VOICES.map((voice) => ({
  voiceId: voice.id,
  name: voice.name,
  previewUrl: undefined,
  labels: {
    description: voice.category,
    "use case": voice.category,
  },
}));

const suggestionChips = [
  { icon: Book, label: "Narrate a story" },
  { icon: Smile, label: "Tell a silly joke" },
  { icon: Mic, label: "Record an advertisement" },
  { icon: Languages, label: "Speak in different languages" },
  { icon: Clapperboard, label: "Direct a dramatic movie scene" },
  { icon: Gamepad2, label: "Hear from a video game character" },
  { icon: Radio, label: "Introduce your podcast" },
  { icon: Flower, label: "Guide a meditation class" },
];

/**
 * TTS Client Component
 *
 * ElevenLabs-style text-to-speech interface with:
 * - Large text input area
 * - Settings panel with voice selection
 * - Audio player with controls
 */
export function TTSClient({ userPlan = "free", currentUsage }: TTSClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const audioRef = useRef<HTMLAudioElement>(null);
  const searchParams = useSearchParams();
  const hasTrackedInitialVoiceSelection = useRef(false);

  const voiceFromUrl = searchParams?.get("voice");

  // Provider state
  const [provider, setProvider] = useState<ProviderType>("elevenlabs");

  // Form state
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<VoicePickerVoice[]>(fallbackVoices);
  const getInitialVoiceId = () => {
    if (voiceFromUrl) {
      const validVoice = voices.find((v) => v.voiceId === voiceFromUrl);
      if (validVoice) return validVoice.voiceId;
    }
    return voices[0]?.voiceId ?? DEFAULT_VOICES[0]?.id;
  };
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(getInitialVoiceId);
  const [stability, setStability] = useState(TTS_DEFAULTS.stability);
  const [similarity, setSimilarity] = useState(TTS_DEFAULTS.similarityBoost);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [languageOverride, setLanguageOverride] = useState(false);
  const [elevenModel, setElevenModel] = useState(TTS_DEFAULTS.model);

  // Minimax-specific state
  const [minimaxModel, setMinimaxModel] = useState(MINIMAX_TTS_DEFAULTS.model);
  const [mmSpeed, setMmSpeed] = useState(MINIMAX_TTS_DEFAULTS.speed);
  const [mmVolume, setMmVolume] = useState(MINIMAX_TTS_DEFAULTS.volume);
  const [mmPitch, setMmPitch] = useState(MINIMAX_TTS_DEFAULTS.pitch);
  const [mmEmotion, setMmEmotion] = useState<string>("");

  const handleProviderChange = (p: ProviderType) => {
    setProvider(p);
    if (p === "minimax") {
      setVoices(minimaxVoices);
      setSelectedVoiceId(minimaxVoices[0]?.voiceId ?? "");
    } else {
      setVoices(fallbackVoices);
      setSelectedVoiceId(fallbackVoices[0]?.voiceId ?? DEFAULT_VOICES[0]?.id);
    }
  };

  // Generation state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // History state
  const [activeSettingsTab, setActiveSettingsTab] = useState<"settings" | "history">("settings");
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [generations, setGenerations] = useState<
    { id: string; text: string; voiceId: string; audioUrl: string; createdAt: string }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Plan limits
  const limits = PLANS[userPlan];
  const maxChars = limits.maxChars;
  const usedChars = currentUsage?.charactersUsed ?? 0;
  const remainingChars = maxChars - usedChars;
  const isOverLimit = text.length > remainingChars;

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.voiceId === selectedVoiceId) ?? voices[0];
  }, [selectedVoiceId, voices]);

  useEffect(() => {
    // Keep selectedVoiceId valid when voice list changes
    if (!voices.length) return;
    if (!voices.some((v) => v.voiceId === selectedVoiceId)) {
      setSelectedVoiceId(voices[0].voiceId);
    }
  }, [selectedVoiceId, voices]);

  useEffect(() => {
    // Fetch richer voice metadata (including previewUrl) when available.
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/voices?defaultOnly=true&limit=100&sortBy=name");
        if (!res.ok) return;
        const json = (await res.json()) as { voices?: Array<Record<string, unknown>> };
        const apiVoices: VoicePickerVoice[] = (json.voices ?? [])
          .map((v): VoicePickerVoice | null => {
            const voiceId = typeof v.voiceId === "string" ? v.voiceId : null;
            const name = typeof v.name === "string" ? v.name : null;
            if (!voiceId || !name) return null;
            return {
              voiceId,
              name,
              previewUrl: typeof v.previewUrl === "string" ? v.previewUrl : undefined,
              labels: {
                accent: typeof v.accent === "string" ? v.accent : undefined,
                gender: typeof v.gender === "string" ? v.gender : undefined,
                age: typeof v.age === "string" ? v.age : undefined,
                description: typeof v.description === "string" ? v.description : undefined,
                "use case": typeof v.category === "string" ? v.category : undefined,
              },
            };
          })
          .filter((v): v is VoicePickerVoice => v !== null);

        if (!cancelled && apiVoices.length) setVoices(apiVoices);
      } catch {
        // Keep fallback voices on failure
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (voiceFromUrl) {
      const validVoice = voices.find((v) => v.voiceId === voiceFromUrl);
      if (validVoice) setSelectedVoiceId(validVoice.voiceId);
    }
  }, [voiceFromUrl, voices]);

  useEffect(() => {
    if (!userId || !selectedVoiceId) return;
    if (!hasTrackedInitialVoiceSelection.current) {
      hasTrackedInitialVoiceSelection.current = true;
      return;
    }
    capturePosthogBrowserEvent("voice_selected", {
      feature: "tts",
      userId,
      voiceId: selectedVoiceId,
    });
  }, [selectedVoiceId, userId]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/generations?limit=20");
      if (!res.ok) throw new Error("Failed to load history");
      const json = await res.json();
      const items = (json.data ?? json.generations ?? []).map(
        (g: Record<string, unknown>) => ({
          id: typeof g._id === "string" ? g._id : (typeof g.id === "string" ? g.id : String(g._id ?? g.id ?? "")),
          text: typeof g.text === "string" ? g.text : "",
          voiceId: typeof g.voiceId === "string" ? g.voiceId : "",
          audioUrl: typeof g.audioUrl === "string" ? g.audioUrl : "",
          createdAt: typeof g.createdAt === "string" ? g.createdAt : "",
        })
      );
      setGenerations(items);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeSettingsTab === "history") {
      fetchHistory();
    }
  }, [activeSettingsTab]);

  const generate = async () => {
    if (!text.trim() || isOverLimit) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setGenerationId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const body = provider === "minimax"
        ? {
            text,
            voiceId: selectedVoiceId,
            provider: "Tenlabs V2",
            model: minimaxModel,
            speed: mmSpeed,
            volume: mmVolume,
            pitch: mmPitch,
            ...(mmEmotion ? { emotion: mmEmotion } : {}),
            format: "mp3",
          }
        : {
            text,
            voiceId: selectedVoiceId,
            provider: "elevenlabs",
            model: elevenModel,
            stability,
            similarityBoost: similarity,
            format: "mp3",
          };

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${res.status})`);
      }

      const json = await res.json();
      if (!json.success || !json.data?.audioUrl || !json.data?.generationId) {
        throw new Error("Invalid response from server");
      }

      setAudioUrl(json.data.audioUrl);
      setGenerationId(json.data.generationId);

      if (userId) {
        capturePosthogBrowserEvent("tts_generated", {
          feature: "tts",
          userId,
          generationId: json.data.generationId,
          textLength: text.length,
          voiceId: selectedVoiceId,
          provider,
        });
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      Sentry.withScope((scope) => {
        scope.setTag("feature", "tts");
        if (userId) scope.setUser({ id: userId });
        Sentry.captureException(e);
      });
      setError(e.message);
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

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `tts-${generationId || "audio"}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (userId && generationId) {
      capturePosthogBrowserEvent("audio_downloaded", {
        feature: "tts",
        userId,
        generationId,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Main Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Editor Area */}
        <div className="flex-1 p-8 relative flex flex-col overflow-y-auto">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full flex-1 min-h-[200px] resize-none outline-none text-lg text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-light leading-relaxed bg-transparent"
            placeholder="Start typing here or paste any text you want to turn into lifelike speech..."
            disabled={loading}
          />

          {/* Character count */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className={isOverLimit ? "text-red-500" : "text-gray-400 dark:text-gray-500"}>
              {text.length.toLocaleString()} / {remainingChars.toLocaleString()} characters remaining
            </span>
            {error && <span className="text-red-500">{error}</span>}
          </div>

          {/* Suggestions / Quick Starts */}
          {!text && (
            <div className="mt-8 min-w-0 max-w-full">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Get started with</p>
              <div className="flex flex-col items-start gap-2.5 min-w-0 max-w-full">
                {suggestionChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => setText(chip.label)}
                      className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-[#444] hover:shadow-sm dark:hover:shadow-none transition-all max-w-full min-w-0 text-left"
                    >
                      <Icon size={16} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="truncate">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl">
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => {
                  setIsPlaying(true);
                  if (userId && generationId) {
                    capturePosthogBrowserEvent("audio_played", {
                      feature: "tts",
                      userId,
                      generationId,
                    });
                  }
                }}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-white dark:text-black" />
                  ) : (
                    <Play size={20} className="text-white dark:text-black ml-1" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-black dark:bg-white rounded-full transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(duration)}</span>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-16 border-t border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between px-6 flex-shrink-0 gap-4">
          {/* Mobile settings button - only visible on small screens */}
          <button
            onClick={() => setMobileSettingsOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] transition-colors"
            aria-label="Open settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="flex-1 lg:flex-initial" />
          <button
            onClick={generate}
            disabled={loading || !text.trim() || isOverLimit}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              loading || !text.trim() || isOverLimit
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate speech"
            )}
          </button>
        </div>
      </main>

      {/* Settings Panel */}
      <aside className="w-[380px] bg-white dark:bg-black border-l border-gray-200 dark:border-[#1a1a1a] flex-col h-full overflow-hidden flex-shrink-0 relative hidden lg:flex transition-colors">
        {/* Main Panel Content */}
        <div className="flex flex-col h-full">
          <div className="flex border-b border-gray-200 dark:border-[#1a1a1a] px-6">
            <button
              onClick={() => setActiveSettingsTab("settings")}
              className={`py-4 mr-6 text-sm font-medium transition-colors ${
                activeSettingsTab === "settings"
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab("history")}
              className={`py-4 text-sm font-medium transition-colors ${
                activeSettingsTab === "history"
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              History
            </button>
          </div>

          {activeSettingsTab === "settings" ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Provider Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Provider</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleProviderChange("elevenlabs")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    provider === "elevenlabs"
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222]"
                  }`}
                >
                  ElevenLabs
                </button>
                <button
                  onClick={() => handleProviderChange("minimax")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    provider === "minimax"
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222]"
                  }`}
                >
                  Minimax
                </button>
              </div>
            </div>

            {/* Voice Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Voice</label>
              <VoicePicker
                voices={voices}
                value={selectedVoiceId}
                onValueChange={(voiceId) => setSelectedVoiceId(voiceId)}
                placeholder={selectedVoice?.name ? selectedVoice.name : "Select a voice..."}
                className="rounded-xl border-gray-200 dark:border-[#333] h-12"
              />
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Model</label>
              {provider === "minimax" ? (
                <select
                  value={minimaxModel}
                  onChange={(e) => setMinimaxModel(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-[#444] transition-colors cursor-pointer outline-none"
                >
                  {MINIMAX_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.description}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={elevenModel}
                  onChange={(e) => setElevenModel(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-[#444] transition-colors cursor-pointer outline-none"
                >
                  {ELEVENLABS_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.description}
                    </option>
                  ))}
                </select>
              )}
            </div>

uld you change this carda and text to             {provider === "minimax" ? (
              <>
                <div className="space-y-6">
                  <SliderControl
                    label="Speed"
                    leftLabel="Slower"
                    rightLabel="Faster"
                    value={mmSpeed * 50}
                    onChange={(v) => setMmSpeed(v / 50)}
                    min={0}
                    max={100}
                  />
                  <SliderControl
                    label="Volume"
                    leftLabel="Quieter"
                    rightLabel="Louder"
                    value={mmVolume * 50}
                    onChange={(v) => setMmVolume(v / 50)}
                    min={0}
                    max={100}
                  />
                  <SliderControl
                    label="Pitch"
                    leftLabel="Lower"
                    rightLabel="Higher"
                    value={(mmPitch + 12) * (100 / 24)}
                    onChange={(v) => setMmPitch(Math.round(v * (24 / 100) - 12))}
                    min={0}
                    max={100}
                  />
                </div>

                {/* Emotion Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Emotion</label>
                  <select
                    value={mmEmotion}
                    onChange={(e) => setMmEmotion(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-[#444] transition-colors cursor-pointer outline-none"
                  >
                    <option value="">None (default)</option>
                    {MINIMAX_EMOTIONS.map((e) => (
                      <option key={e} value={e}>
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setMmSpeed(MINIMAX_TTS_DEFAULTS.speed);
                      setMmVolume(MINIMAX_TTS_DEFAULTS.volume);
                      setMmPitch(MINIMAX_TTS_DEFAULTS.pitch);
                      setMmEmotion("");
                      setMinimaxModel(MINIMAX_TTS_DEFAULTS.model);
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset values
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  <SliderControl
                    label="Stability"
                    leftLabel="More variable"
                    rightLabel="More stable"
                    value={stability * 100}
                    onChange={(v) => setStability(v / 100)}
                  />
                  <SliderControl
                    label="Similarity"
                    leftLabel="Low"
                    rightLabel="High"
                    value={similarity * 100}
                    onChange={(v) => setSimilarity(v / 100)}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black dark:text-white">Language Override</span>
                    <button
                      onClick={() => setLanguageOverride(!languageOverride)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        languageOverride ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full absolute top-0.5 transition-transform ${
                          languageOverride ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black dark:text-white">Speaker boost</span>
                    <button
                      onClick={() => setSpeakerBoost(!speakerBoost)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        speakerBoost ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full absolute top-0.5 transition-transform ${
                          speakerBoost ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Reset */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setStability(TTS_DEFAULTS.stability);
                      setSimilarity(TTS_DEFAULTS.similarityBoost);
                      setElevenModel(TTS_DEFAULTS.model);
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset values
                  </button>
                </div>
              </>
            )}
          </div>
          ) : (
          <div className="flex-1 overflow-y-auto">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500" />
              </div>
            ) : historyError ? (
              <div className="p-6 text-center text-sm text-red-500">{historyError}</div>
            ) : generations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <Clock size={32} className="mb-3" />
                <p className="text-sm font-medium">No generations yet</p>
                <p className="text-xs mt-1">Your generated audio will appear here</p>
              </div>
            ) : (
              <div>
                {generations.map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => {
                      setAudioUrl(gen.audioUrl);
                      setGenerationId(gen.id);
                      setIsPlaying(false);
                      setCurrentTime(0);
                      setDuration(0);
                    }}
                    className="w-full text-left p-3 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">
                      {gen.text || "Untitled generation"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {gen.createdAt
                          ? new Date(gen.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudioUrl(gen.audioUrl);
                            setGenerationId(gen.id);
                            setIsPlaying(false);
                            if (audioRef.current) {
                              audioRef.current.src = gen.audioUrl;
                              audioRef.current.play().catch(() => {});
                            }
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                        >
                          <Play size={12} className="text-gray-500 dark:text-gray-400" />
                        </span>
                        <a
                          href={gen.audioUrl}
                          download={`tts-${gen.id}.mp3`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                        >
                          <Download size={12} className="text-gray-500 dark:text-gray-400" />
                        </a>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </aside>

      {/* Mobile Settings Sheet - only rendered on small screens, opens via Settings button */}
      <Sheet open={mobileSettingsOpen} onOpenChange={setMobileSettingsOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[380px] p-0 gap-0 bg-white dark:bg-black border-l border-gray-200 dark:border-[#1a1a1a] flex flex-col h-full overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-[#1a1a1a] px-6 flex-shrink-0">
              <button
                onClick={() => setActiveSettingsTab("settings")}
                className={`py-4 mr-6 text-sm font-medium transition-colors ${
                  activeSettingsTab === "settings"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveSettingsTab("history")}
                className={`py-4 text-sm font-medium transition-colors ${
                  activeSettingsTab === "history"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                History
              </button>
            </div>
            {activeSettingsTab === "settings" ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Provider</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProviderChange("elevenlabs")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        provider === "elevenlabs"
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222]"
                      }`}
                    >
                      ElevenLabs
                    </button>
                    <button
                      onClick={() => handleProviderChange("minimax")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        provider === "minimax"
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222]"
                      }`}
                    >
                      Minimax
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Voice</label>
                  <VoicePicker
                    voices={voices}
                    value={selectedVoiceId}
                    onValueChange={(voiceId) => setSelectedVoiceId(voiceId)}
                    placeholder={selectedVoice?.name ? selectedVoice.name : "Select a voice..."}
                    className="rounded-xl border-gray-200 dark:border-[#333] h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Model</label>
                  {provider === "minimax" ? (
                    <select
                      value={minimaxModel}
                      onChange={(e) => setMinimaxModel(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-[#444] transition-colors cursor-pointer outline-none"
                    >
                      {MINIMAX_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.description}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={elevenModel}
                      onChange={(e) => setElevenModel(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-[#444] transition-colors cursor-pointer outline-none"
                    >
                      {ELEVENLABS_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.description}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {provider === "minimax" ? (
                  <div className="space-y-6">
                    <SliderControl
                      label="Speed"
                      leftLabel="Slower"
                      rightLabel="Faster"
                      value={mmSpeed * 50}
                      onChange={(v) => setMmSpeed(v / 50)}
                      min={0}
                      max={100}
                    />
                    <SliderControl
                      label="Volume"
                      leftLabel="Quieter"
                      rightLabel="Louder"
                      value={mmVolume * 50}
                      onChange={(v) => setMmVolume(v / 50)}
                      min={0}
                      max={100}
                    />
                    <SliderControl
                      label="Pitch"
                      leftLabel="Lower"
                      rightLabel="Higher"
                      value={(mmPitch + 12) * (100 / 24)}
                      onChange={(v) => setMmPitch(Math.round(v * (24 / 100) - 12))}
                      min={0}
                      max={100}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black dark:text-white">Emotion</label>
                      <select
                        value={mmEmotion}
                        onChange={(e) => setMmEmotion(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-[#444] transition-colors cursor-pointer outline-none"
                      >
                        <option value="">None (default)</option>
                        {MINIMAX_EMOTIONS.map((e) => (
                          <option key={e} value={e}>
                            {e.charAt(0).toUpperCase() + e.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <SliderControl
                      label="Stability"
                      leftLabel="More variable"
                      rightLabel="More stable"
                      value={stability * 100}
                      onChange={(v) => setStability(v / 100)}
                    />
                    <SliderControl
                      label="Similarity"
                      leftLabel="Low"
                      rightLabel="High"
                      value={similarity * 100}
                      onChange={(v) => setSimilarity(v / 100)}
                    />
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black dark:text-white">Language Override</span>
                        <button
                          onClick={() => setLanguageOverride(!languageOverride)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            languageOverride ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full absolute top-0.5 transition-transform ${
                              languageOverride ? "left-[22px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black dark:text-white">Speaker boost</span>
                        <button
                          onClick={() => setSpeakerBoost(!speakerBoost)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            speakerBoost ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full absolute top-0.5 transition-transform ${
                              speakerBoost ? "left-[22px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                ) : historyError ? (
                  <div className="p-6 text-center text-sm text-red-500">{historyError}</div>
                ) : generations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                    <Clock size={32} className="mb-3" />
                    <p className="text-sm font-medium">No generations yet</p>
                    <p className="text-xs mt-1">Your generated audio will appear here</p>
                  </div>
                ) : (
                  <div>
                    {generations.map((gen) => (
                      <button
                        key={gen.id}
                        onClick={() => {
                          setText(gen.text || "");
                          setAudioUrl(gen.audioUrl);
                          setGenerationId(gen.id);
                          setIsPlaying(false);
                          setCurrentTime(0);
                          setDuration(0);
                          setMobileSettingsOpen(false);
                        }}
                        className="w-full text-left p-3 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">
                          {gen.text || "Untitled generation"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {gen.createdAt
                              ? new Date(gen.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SliderControl({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-black dark:text-white underline decoration-dotted underline-offset-4 decoration-gray-300 dark:decoration-gray-600 cursor-help">
          {label}
        </label>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full group cursor-pointer">
        <div className="absolute h-full bg-black dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black dark:bg-white rounded-full shadow-sm pointer-events-none"
          style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
}
