"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Download,
  Loader2,
  ChevronDown,
  Check,
  Search,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";

import { DEFAULT_VOICES, TEXT_TO_DIALOGUE_CONFIG, PLANS } from "@/constants";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";

interface TextToDialogueClientProps {
  userId?: string;
  userPlan?: "free" | "starter" | "creator" | "pro";
  currentUsage?: {
    dialogueGenerationsUsed: number;
    dialogueCharactersUsed: number;
  };
}

interface DialogueLine {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
}

interface DialogueHistory {
  _id: string;
  title: string;
  inputs: { text: string; voiceId: string; voiceName?: string }[];
  totalCharacters: number;
  createdAt: string;
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

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

/**
 * Text to Dialogue Client Component
 *
 * Create immersive dialogue with multiple speakers.
 */
export function TextToDialogueClient({
  userId,
  userPlan = "free",
  currentUsage,
}: TextToDialogueClientProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Dialog lines state
  const [lines, setLines] = useState<DialogueLine[]>([
    { id: generateId(), text: "", voiceId: voicesList[0].id, voiceName: voicesList[0].name },
    { id: generateId(), text: "", voiceId: voicesList[1].id, voiceName: voicesList[1].name },
  ]);
  const [title, setTitle] = useState("Untitled dialogue");

  // Voice dropdown state per line
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Generation state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dialogueId, setDialogueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // History state
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [history, setHistory] = useState<DialogueHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [playingHistoryId, setPlayingHistoryId] = useState<string | null>(null);
  const historyAudioRef = useRef<HTMLAudioElement>(null);

  // Plan limits
  const limits = PLANS[userPlan];
  const maxGenerations = limits.maxDialogueGenerations;
  const maxChars = limits.maxDialogueCharacters;
  const usedGenerations = currentUsage?.dialogueGenerationsUsed ?? 0;
  const usedChars = currentUsage?.dialogueCharactersUsed ?? 0;
  const remainingGenerations = maxGenerations - usedGenerations;
  const remainingChars = maxChars - usedChars;

  // Calculate total characters
  const totalChars = lines.reduce((sum, line) => sum + line.text.length, 0);
  const isOverLimit = totalChars > remainingChars || remainingGenerations <= 0;

  const filteredVoices = voicesList.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/text-to-dialogue?page=1&limit=20");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.dialogues ?? []);
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history" && history.length === 0) {
      fetchHistory();
    }
  }, [activeTab, fetchHistory, history.length]);

  const addLine = () => {
    if (lines.length >= TEXT_TO_DIALOGUE_CONFIG.maxLines) return;
    const nextVoice = voicesList[(lines.length) % voicesList.length];
    setLines([
      ...lines,
      { id: generateId(), text: "", voiceId: nextVoice.id, voiceName: nextVoice.name },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((line) => line.id !== id));
  };

  const updateLine = (id: string, field: "text" | "voiceId", value: string) => {
    setLines(
      lines.map((line) => {
        if (line.id !== id) return line;
        if (field === "voiceId") {
          const voice = voicesList.find((v) => v.id === value);
          return { ...line, voiceId: value, voiceName: voice?.name ?? "" };
        }
        return { ...line, [field]: value };
      })
    );
  };

  const generate = async () => {
    const validLines = lines.filter((l) => l.text.trim().length > 0);
    if (validLines.length < 2 || isOverLimit) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setDialogueId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const response = await fetch("/api/text-to-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          inputs: validLines.map((l) => ({
            text: l.text,
            voiceId: l.voiceId,
            voiceName: l.voiceName,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Generation failed");
      }

      setAudioUrl(result.data.audioUrl);
      setDialogueId(result.data.dialogueId);

      if (userId) {
        capturePosthogBrowserEvent("dialogue_generated", {
          feature: "text-to-dialogue",
          userId,
          plan: userPlan,
          dialogueId: result.data.dialogueId,
          totalCharacters: totalChars,
          lineCount: validLines.length,
          durationSeconds: result.data.duration,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  };

  // Audio player handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePlayHistory = (item: DialogueHistory) => {
    if (playingHistoryId === item._id && historyAudioRef.current) {
      historyAudioRef.current.pause();
      setPlayingHistoryId(null);
      return;
    }
    setPlayingHistoryId(item._id);
    if (historyAudioRef.current) {
      historyAudioRef.current.src = `/api/text-to-dialogue/${item._id}/audio`;
      historyAudioRef.current.play().catch(() => setPlayingHistoryId(null));
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/text-to-dialogue/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory(history.filter((h) => h._id !== id));
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      <audio
        ref={historyAudioRef}
        onEnded={() => setPlayingHistoryId(null)}
        onError={() => setPlayingHistoryId(null)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Text to Dialogue</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create immersive, natural-sounding dialogue with multiple speakers.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "create"
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "history"
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
              }`}
            >
              History
              {history.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-gray-100 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "create" ? (
            <>
              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dialogue Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#1a1a1a] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  placeholder="Enter a title for your dialogue..."
                />
              </div>

              {/* Dialogue Lines */}
              <div className="space-y-4 mb-6">
                {lines.map((line, index) => (
                  <div
                    key={line.id}
                    className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        Line {index + 1}
                      </span>
                      {lines.length > 2 && (
                        <button
                          onClick={() => removeLine(line.id)}
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Voice Selector */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdownId(openDropdownId === line.id ? null : line.id)
                        }
                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg hover:border-gray-300 dark:hover:border-[#444] transition-colors bg-white dark:bg-[#0a0a0a]"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                              voicesList.find((v) => v.id === line.voiceId)?.color ??
                              "from-gray-400 to-gray-500"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {line.voiceName || "Select voice"}
                          </span>
                        </div>
                        <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
                      </button>

                      {openDropdownId === line.id && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg shadow-lg dark:shadow-none z-20 max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-gray-100 dark:border-[#333]">
                            <div className="relative">
                              <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                              />
                              <input
                                type="text"
                                placeholder="Search voices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-1">
                            {filteredVoices.map((voice) => (
                              <button
                                key={voice.id}
                                onClick={() => {
                                  updateLine(line.id, "voiceId", voice.id);
                                  setOpenDropdownId(null);
                                  setSearchQuery("");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#252525] rounded-lg transition-colors"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${voice.color}`}
                                />
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {voice.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{voice.category}</p>
                                </div>
                                {line.voiceId === voice.id && (
                                  <Check size={16} className="text-black dark:text-white" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Input */}
                    <textarea
                      value={line.text}
                      onChange={(e) => updateLine(line.id, "text", e.target.value)}
                      placeholder={`[cheerfully] Hello, how are you?`}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] rounded-lg text-sm resize-none bg-white dark:bg-[#0a0a0a] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                      rows={2}
                    />

                    {/* Emotion Tags Hint */}
                    <div className="flex flex-wrap gap-1">
                      {TEXT_TO_DIALOGUE_CONFIG.emotionTags.slice(0, 6).map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            updateLine(line.id, "text", `[${tag}] ${line.text}`)
                          }
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                        >
                          [{tag}]
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add Line Button */}
                {lines.length < TEXT_TO_DIALOGUE_CONFIG.maxLines && (
                  <button
                    onClick={addLine}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-[#444] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <Plus size={18} />
                    Add another line
                  </button>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Generate Button and Stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {totalChars.toLocaleString()} / {remainingChars.toLocaleString()} characters remaining
                  <span className="mx-2">•</span>
                  {remainingGenerations} generations remaining
                </div>
                <button
                  onClick={generate}
                  disabled={
                    loading ||
                    lines.filter((l) => l.text.trim()).length < 2 ||
                    isOverLimit
                  }
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    loading ||
                    lines.filter((l) => l.text.trim()).length < 2 ||
                    isOverLimit
                      ? "bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate Dialogue"
                  )}
                </button>
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="w-12 h-12 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause size={20} className="text-white dark:text-black" />
                      ) : (
                        <Play size={20} className="text-white dark:text-black ml-1" fill="currentColor" />
                      )}
                    </button>

                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-gray-200 dark:bg-[#333] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gray-900 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <a
                      href={`/api/text-to-dialogue/${dialogueId}/audio`}
                      download={`${title}.mp3`}
                      className="p-2.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                    >
                      <Download size={18} className="text-gray-700 dark:text-white" />
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* History Tab */
            <div>
              {historyLoading ? (
                <div className="py-12 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No dialogue generations yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl p-4 hover:border-gray-300 dark:hover:border-[#444] transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePlayHistory(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              playingHistoryId === item._id
                                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]"
                            }`}
                          >
                            {playingHistoryId === item._id ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} className="ml-0.5" fill="currentColor" />
                            )}
                          </button>
                          <a
                            href={`/api/text-to-dialogue/${item._id}/audio`}
                            download={`${item.title}.mp3`}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteHistory(item._id)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {item.inputs.length} lines • {item.totalCharacters} characters •{" "}
                        {formatDate(item.createdAt)}
                      </p>
                      <div className="space-y-1">
                        {item.inputs.slice(0, 3).map((input, i) => (
                          <p key={i} className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            <span className="font-medium">{input.voiceName || "Voice"}:</span>{" "}
                            {input.text}
                          </p>
                        ))}
                        {item.inputs.length > 3 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            +{item.inputs.length - 3} more lines
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
