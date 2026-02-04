"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  ChevronRight,
  Search,
  Play,
  Pause,
  Download,
  Zap,
  Clock,
  Dog,
  Music,
  Bomb,
  Wind,
  Sparkles,
  Disc,
  Settings,
  ArrowUp,
  Loader2,
  Trash2,
  Volume2,
} from "lucide-react";
import Link from "next/link";

import { SFX_CONFIG } from "@/constants";

const categories = [
  { name: "Animals", color: "from-orange-400 to-red-500", icon: Dog, prompt: "animal sounds" },
  { name: "Bass", color: "from-red-500 to-orange-600", icon: Music, prompt: "deep bass sound" },
  { name: "Booms", color: "from-amber-500 to-orange-500", icon: Bomb, prompt: "explosion boom" },
  { name: "Braams", color: "from-orange-400 to-amber-500", icon: Wind, prompt: "cinematic braam" },
  { name: "Brass", color: "from-yellow-400 to-orange-400", icon: Sparkles, prompt: "brass instrument" },
  { name: "Cymbals", color: "from-amber-400 to-yellow-500", icon: Disc, prompt: "cymbal crash" },
  { name: "Devices", color: "from-orange-500 to-red-400", icon: Settings, prompt: "electronic device" },
];

interface SoundEffectItem {
  id: string;
  text: string;
  durationSeconds: number;
  audioUrl: string;
  isFavorite: boolean;
  createdAt: string;
}

interface PaginatedSoundEffects {
  soundEffects: SoundEffectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(1)}s`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function SoundEffectsPage() {
  const { user } = useUser();
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState<"explore" | "history">("explore");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<PaginatedSoundEffects | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Audio playback
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch history
  const fetchHistory = useCallback(async (page: number = 1) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      const res = await fetch(`/api/sfx?${params}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as PaginatedSoundEffects;
      setHistory(json);
    } catch (err) {
      Sentry.captureException(err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Load history on mount and when tab changes
  useEffect(() => {
    if (activeTab === "history" && !history) {
      fetchHistory();
    }
  }, [activeTab, history, fetchHistory]);

  // Filter by search
  const filteredSoundEffects = useMemo(() => {
    if (!history?.soundEffects) return [];
    if (!searchQuery.trim()) return history.soundEffects;
    const query = searchQuery.toLowerCase();
    return history.soundEffects.filter((s) => s.text.toLowerCase().includes(query));
  }, [history?.soundEffects, searchQuery]);

  // Generate sound effect
  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/sfx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt.trim() }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      // Success - clear prompt and switch to history
      setPrompt("");
      setActiveTab("history");
      await fetchHistory();
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      Sentry.withScope((scope) => {
        scope.setTag("feature", "sfx");
        if (userId) scope.setUser({ id: userId });
        Sentry.captureException(e);
      });
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  // Category click
  const handleCategoryClick = (categoryPrompt: string) => {
    setPrompt(categoryPrompt);
  };

  // Toggle play
  const togglePlay = (item: SoundEffectItem) => {
    if (!audioRef.current) return;

    if (playingId === item.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    setPlayingId(item.id);
    audioRef.current.src = item.audioUrl;
    audioRef.current.play().catch(() => {
      setError("Failed to play audio");
      setPlayingId(null);
    });
  };

  // Delete sound effect
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sfx/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Delete failed (${res.status})`);
      }
      await fetchHistory(history?.page ?? 1);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      Sentry.captureException(e);
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Download audio
  const handleDownload = async (item: SoundEffectItem) => {
    try {
      const res = await fetch(item.audioUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sound-effect-${item.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download audio");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Title and Tabs */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black mb-6">Sound Effects</h1>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("explore")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "explore"
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  Explore
                </button>
                <button
                  onClick={() => {
                    setActiveTab("history");
                    if (!history) fetchHistory();
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "history"
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  History
                  {history && history.total > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
                      {history.total}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-500 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Explore Tab */}
          {activeTab === "explore" && (
            <>
              {/* Category Cards */}
              <div className="relative mb-8">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.prompt)}
                        className="flex-shrink-0 w-[140px] h-[120px] rounded-2xl overflow-hidden relative group"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}
                        ></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                          <Icon size={16} />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Sample prompts */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Try these prompts</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cinematic braam, horror",
                    "Footsteps on wooden floor",
                    "Thunder rumble distant",
                    "Sci-fi door opening",
                    "Wind howling through trees",
                    "Glass breaking impact",
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setPrompt(sample)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrade Banner */}
              <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Zap size={20} className="text-white fill-white" />
                  </div>
                  <span className="font-medium text-gray-900">
                    Generate AI sound effects from text descriptions
                  </span>
                </div>
                <Link
                  href="/billing"
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Upgrade plan
                </Link>
              </div>
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <>
              {/* Search */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search your sound effects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* Loading */}
              {historyLoading && !history && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}

              {/* Empty state */}
              {!historyLoading && history && history.soundEffects.length === 0 && (
                <div className="py-12 text-center">
                  <Volume2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No sound effects yet</p>
                  <p className="text-sm text-gray-400">
                    Describe a sound below to generate your first effect
                  </p>
                </div>
              )}

              {/* Sound effects list */}
              {filteredSoundEffects.length > 0 && (
                <>
                  <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <div>Description</div>
                    <div className="text-right">Duration</div>
                    <div className="text-right">Created</div>
                    <div></div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredSoundEffects.map((sound) => (
                      <div
                        key={sound.id}
                        className="grid grid-cols-[1fr_100px_100px_100px] gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <button
                            onClick={() => togglePlay(sound)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              playingId === sound.id
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                            }`}
                          >
                            {playingId === sound.id ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} className="ml-0.5" />
                            )}
                          </button>
                          <p className="text-sm text-gray-900 truncate">{sound.text}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(sound.durationSeconds)}
                          </span>
                        </div>

                        <div className="text-right text-sm text-gray-500">
                          {formatRelativeTime(sound.createdAt)}
                        </div>

                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownload(sound)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sound.id)}
                            disabled={deletingId === sound.id}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === sound.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {history && history.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Page {history.page} of {history.totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchHistory(history.page - 1)}
                          disabled={history.page <= 1 || historyLoading}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchHistory(history.page + 1)}
                          disabled={history.page >= history.totalPages || historyLoading}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* No search results */}
              {searchQuery && filteredSoundEffects.length === 0 && history && history.soundEffects.length > 0 && (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No sound effects match &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Input Bar */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Describe a sound..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              disabled={generating}
              maxLength={SFX_CONFIG.maxPromptLength}
              className="w-full pl-4 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors disabled:opacity-50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <ArrowUp size={18} className="text-white" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                {prompt.length}/{SFX_CONFIG.maxPromptLength}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Press Enter to generate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
