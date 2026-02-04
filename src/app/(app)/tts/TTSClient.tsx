"use client";

import { useState, useRef, useEffect } from "react";
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
  X,
  ChevronRight,
  RotateCcw,
  Search,
  Play,
  Pause,
  Download,
  SlidersHorizontal,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

import { DEFAULT_VOICES, TTS_DEFAULTS, PLANS } from "@/constants";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";

interface TTSClientProps {
  userPlan?: "free" | "pro";
  currentUsage?: {
    charactersUsed: number;
    generationsUsed: number;
  };
}

const voicesList = DEFAULT_VOICES.map((voice, index) => ({
  id: voice.id,
  name: voice.name,
  description: `${voice.category} voice`,
  color: [
    "from-blue-400 to-cyan-400",
    "from-emerald-400 to-teal-400",
    "from-orange-400 to-amber-400",
    "from-pink-400 to-rose-400",
    "from-purple-400 to-violet-400",
    "from-green-400 to-emerald-400",
    "from-amber-400 to-yellow-400",
    "from-red-400 to-orange-400",
    "from-teal-400 to-cyan-400",
    "from-indigo-400 to-blue-400",
  ][index % 10],
  category: voice.category,
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
  const getInitialVoice = () => {
    if (voiceFromUrl) {
      const validVoice = voicesList.find((v) => v.id === voiceFromUrl);
      if (validVoice) return validVoice;
    }
    return voicesList[0];
  };

  // Form state
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(getInitialVoice);
  const [stability, setStability] = useState(TTS_DEFAULTS.stability);
  const [similarity, setSimilarity] = useState(TTS_DEFAULTS.similarityBoost);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [languageOverride, setLanguageOverride] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // Generation state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Plan limits
  const limits = PLANS[userPlan];
  const maxChars = limits.maxChars;
  const usedChars = currentUsage?.charactersUsed ?? 0;
  const remainingChars = maxChars - usedChars;
  const isOverLimit = text.length > remainingChars;

  useEffect(() => {
    if (voiceFromUrl) {
      const validVoice = voicesList.find((v) => v.id === voiceFromUrl);
      if (validVoice) setSelectedVoice(validVoice);
    }
  }, [voiceFromUrl]);

  useEffect(() => {
    if (!userId || !selectedVoice.id) return;
    if (!hasTrackedInitialVoiceSelection.current) {
      hasTrackedInitialVoiceSelection.current = true;
      return;
    }
    capturePosthogBrowserEvent("voice_selected", {
      feature: "tts",
      userId,
      voiceId: selectedVoice.id,
    });
  }, [selectedVoice.id, userId]);

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
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          stability,
          similarityBoost: similarity,
          format: "mp3",
        }),
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
          voiceId: selectedVoice.id,
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
            className="w-full flex-1 min-h-[200px] resize-none outline-none text-lg text-gray-800 placeholder:text-gray-400 font-light leading-relaxed bg-transparent"
            placeholder="Start typing here or paste any text you want to turn into lifelike speech..."
            disabled={loading}
          />

          {/* Character count */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className={isOverLimit ? "text-red-500" : "text-gray-400"}>
              {text.length.toLocaleString()} / {remainingChars.toLocaleString()} characters remaining
            </span>
            {error && <span className="text-red-500">{error}</span>}
          </div>

          {/* Suggestions / Quick Starts */}
          {!text && (
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">Get started with</p>
              <div className="flex flex-wrap gap-3">
                {suggestionChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => setText(chip.label)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all"
                    >
                      <Icon size={16} className="text-gray-500" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
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
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-white" />
                  ) : (
                    <Play size={20} className="text-white ml-1" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-black rounded-full transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-16 border-t border-gray-100 flex items-center justify-end px-6 flex-shrink-0 gap-4">
          <button
            onClick={generate}
            disabled={loading || !text.trim() || isOverLimit}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              loading || !text.trim() || isOverLimit
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
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
      <aside className="w-[380px] bg-white border-l border-gray-200 flex-col h-full overflow-hidden flex-shrink-0 relative hidden lg:flex">
        {/* Voice Selector Dropdown */}
        {isVoiceDropdownOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <button
                onClick={() => setIsVoiceDropdownOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={18} className="text-gray-600 rotate-180" />
              </button>
              <span className="text-sm font-medium text-gray-900">Select a voice</span>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search voices..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white"
                  />
                </div>
                <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {voicesList.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice);
                    setIsVoiceDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                    selectedVoice.id === voice.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${voice.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{voice.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{voice.category}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Play size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={14} className="text-gray-500" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Panel Content */}
        <div className={`flex flex-col h-full ${isVoiceDropdownOpen ? "invisible" : ""}`}>
          <div className="flex border-b border-gray-200 px-6">
            <button className="py-4 mr-6 text-sm font-medium text-black border-b-2 border-black">
              Settings
            </button>
            <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-800">
              History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Promo Banner */}
            <div className="relative p-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden group cursor-pointer">
              <button className="absolute top-3 right-3 text-white/80 hover:text-white">
                <X size={16} />
              </button>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <div className="w-6 h-6 border-2 border-white rounded-sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Try Studio 3.0</h3>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Voiceovers, Eleven Music and SFX in one editor - now with video support.
                  </p>
                </div>
              </div>
            </div>

            {/* Voice Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Voice</label>
              <button
                onClick={() => setIsVoiceDropdownOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedVoice.color}`} />
                  <span className="text-sm font-medium text-gray-900">{selectedVoice.name}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Model</label>
              <div className="w-full p-1 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <span className="px-1.5 py-0.5 rounded border border-black text-[10px] font-bold text-black">
                      V2
                    </span>
                    <span className="text-sm font-medium text-gray-900">Eleven Multilingual v2</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Settings Sliders */}
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
                <span className="text-sm font-medium text-black">Language Override</span>
                <button
                  onClick={() => setLanguageOverride(!languageOverride)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    languageOverride ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      languageOverride ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Speaker boost</span>
                <button
                  onClick={() => setSpeakerBoost(!speakerBoost)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    speakerBoost ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
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
                }}
                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black transition-colors"
              >
                <RotateCcw size={14} />
                Reset values
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SliderControl({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-black underline decoration-dotted underline-offset-4 decoration-gray-300 cursor-help">
          {label}
        </label>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-1.5 bg-gray-100 rounded-full group cursor-pointer">
        <div className="absolute h-full bg-black rounded-full" style={{ width: `${value}%` }} />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black rounded-full shadow-sm pointer-events-none"
          style={{ left: `${value}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
}
