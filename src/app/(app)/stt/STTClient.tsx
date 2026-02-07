"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  Search,
  FileText,
  Loader2,
  Copy,
  Download,
  Play,
  Pause,
  Trash2,
  Clock,
  ChevronRight,
  Mic,
  Upload,
} from "lucide-react";

import { PLANS, STT_CONFIG } from "@/constants";
import { RealtimeSTT } from "./RealtimeSTT";
import {
  TranscriptViewerContainer,
  TranscriptViewerAudio,
  TranscriptViewerWords,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  type CharacterAlignmentResponseModel,
} from "@/components/ui/transcript-viewer";

interface STTClientProps {
  userPlan?: "free" | "pro";
  currentUsage?: {
    transcriptionMinutesUsed: number;
    transcriptionsUsed: number;
  };
}

type TranscriptionResult = {
  transcriptionId: string;
  text: string;
  language: string;
  duration: number;
  audioUrl: string;
  words?: { text: string; start: number; end: number; speaker?: string }[];
};

/**
 * Convert word-level timing data to character-level alignment
 * required by the TranscriptViewer component.
 */
function wordsToAlignment(
  words: { text: string; start: number; end: number }[]
): CharacterAlignmentResponseModel {
  const characters: string[] = [];
  const starts: number[] = [];
  const ends: number[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const charCount = w.text.length;
    const charDuration = charCount > 0 ? (w.end - w.start) / charCount : 0;

    for (let c = 0; c < charCount; c++) {
      characters.push(w.text[c]);
      starts.push(w.start + c * charDuration);
      ends.push(w.start + (c + 1) * charDuration);
    }

    // Add space between words (not after the last word)
    if (i < words.length - 1) {
      characters.push(" ");
      starts.push(w.end);
      ends.push(words[i + 1].start);
    }
  }

  return {
    characters,
    characterStartTimesSeconds: starts,
    characterEndTimesSeconds: ends,
  };
}

interface TranscriptionListItem {
  id: string;
  originalFileName: string;
  textPreview: string;
  language: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
}

interface PaginatedTranscriptions {
  transcriptions: TranscriptionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatSeconds(seconds: number): string {
  const s = Math.max(0, seconds || 0);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function STTClient({ userPlan = "free", currentUsage }: STTClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const audioRef = useRef<HTMLAudioElement>(null);
  const historyAudioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // History state
  const [history, setHistory] = useState<PaginatedTranscriptions | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [playingHistoryId, setPlayingHistoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "realtime">("upload");
  const [realtimeActive, setRealtimeActive] = useState(false);

  // Reset Aurora when leaving the page or switching tabs
  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("realtime-scribe-active", { detail: false })
      );
    };
  }, []);

  const limits = PLANS[userPlan];
  const remainingTranscriptions = Math.max(
    0,
    limits.maxTranscriptions - (currentUsage?.transcriptionsUsed ?? 0)
  );

  // Fetch transcription history
  const fetchHistory = useCallback(async (page: number = 1) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      const res = await fetch(`/api/stt?${params}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as PaginatedTranscriptions;
      setHistory(json);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setHistoryError(e.message);
      Sentry.captureException(e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter transcriptions by search query
  const filteredTranscriptions = useMemo(() => {
    if (!history?.transcriptions) return [];
    if (!searchQuery.trim()) return history.transcriptions;
    
    const query = searchQuery.toLowerCase();
    return history.transcriptions.filter(
      (t) =>
        t.originalFileName.toLowerCase().includes(query) ||
        t.textPreview.toLowerCase().includes(query)
    );
  }, [history?.transcriptions, searchQuery]);

  // Handle delete transcription
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/stt/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Delete failed (${res.status})`);
      }
      // Refresh the list
      await fetchHistory(history?.page ?? 1);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      Sentry.withScope((scope) => {
        scope.setTag("feature", "stt");
        if (userId) scope.setUser({ id: userId });
        Sentry.captureException(e);
      });
      setHistoryError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle play for history item
  const toggleHistoryPlay = (item: TranscriptionListItem) => {
    if (!historyAudioRef.current) return;

    if (playingHistoryId === item.id) {
      historyAudioRef.current.pause();
      setPlayingHistoryId(null);
      return;
    }

    setPlayingHistoryId(item.id);
    historyAudioRef.current.src = item.audioUrl;
    historyAudioRef.current.play().catch(() => {
      setHistoryError("Failed to play audio");
      setPlayingHistoryId(null);
    });
  };

  const fileTooLarge = useMemo(() => {
    if (!file) return false;
    const sizeMB = file.size / (1024 * 1024);
    return sizeMB > STT_CONFIG.maxFileSizeMB;
  }, [file]);

  const invalidExtension = useMemo(() => {
    if (!file) return false;
    const parts = file.name.split(".");
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    return ext ? !STT_CONFIG.allowedFormats.includes(ext) : false;
  }, [file]);

  const canSubmit = Boolean(file) && !fileTooLarge && !invalidExtension && !loading;

  async function handleTranscribe() {
    if (!file || !canSubmit) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/stt", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      const data = json.data as TranscriptionResult;
      if (!data?.transcriptionId || typeof data.text !== "string") {
        throw new Error("Invalid response from server");
      }

      setResult(data);
      // Refresh history to show the new transcription
      await fetchHistory();
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");

      Sentry.withScope((scope) => {
        scope.setTag("feature", "stt");
        if (userId) scope.setUser({ id: userId });
        Sentry.captureException(e);
      });

      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
  }

  function handleDownloadTxt() {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${result.transcriptionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Speech to text</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transcribe audio with our industry-leading ASR model.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 p-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "upload"
                ? "bg-white dark:bg-[#252525] text-black dark:text-white shadow-sm dark:shadow-none"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Upload size={16} />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("realtime")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "realtime"
                ? "bg-white dark:bg-[#252525] text-black dark:text-white shadow-sm dark:shadow-none"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Mic size={16} />
            Realtime
            <span className="px-1.5 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">
              New
            </span>
          </button>
        </div>

        {/* Realtime Tab Content */}
        {activeTab === "realtime" && (
          <RealtimeSTT
            userPlan={userPlan}
            onActiveChange={(active) => {
              setRealtimeActive(active);
              // Tell GhostCursorBg to hide/show
              window.dispatchEvent(
                new CustomEvent("realtime-scribe-active", { detail: active })
              );
            }}
          />
        )}

        {/* Upload Tab Content */}
        {activeTab === "upload" && (
          <>
            {/* Upload Button */}
            <div className="mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FileText size={16} />
                Select file to transcribe
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={STT_CONFIG.allowedMimeTypes.join(",")}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setError(null);
                  setResult(null);
                }}
                className="hidden"
              />
            </div>

        {/* File Selected */}
        {file && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="flex items-center gap-3">
                {fileTooLarge && (
                  <span className="text-sm text-red-500 dark:text-red-400">File too large (max {STT_CONFIG.maxFileSizeMB}MB)</span>
                )}
                {invalidExtension && (
                  <span className="text-sm text-red-500 dark:text-red-400">Invalid format</span>
                )}
                <button
                  onClick={handleTranscribe}
                  disabled={!canSubmit}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    canSubmit
                      ? "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                      : "bg-gray-300 dark:bg-[#333] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Transcribing...
                    </span>
                  ) : (
                    "Transcribe"
                  )}
                </button>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
          </div>
        )}

        {/* Transcription Result */}
        {result && (
          <div className="mb-8 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#333]">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Transcription Result</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Duration: {formatSeconds(result.duration)} • Language: {result.language}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Transcript Viewer with word-by-word highlighting */}
            {result.words && result.words.length > 0 ? (
              <TranscriptViewerContainer
                audioSrc={result.audioUrl}
                audioType="audio/mpeg"
                alignment={wordsToAlignment(result.words)}
                className="p-6"
              >
                <TranscriptViewerAudio />
                <div className="max-h-[300px] overflow-y-auto rounded-lg bg-gray-50 dark:bg-[#0a0a0a] p-4">
                  <TranscriptViewerWords className="text-base leading-relaxed" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <TranscriptViewerPlayPauseButton className="h-10 w-10 rounded-full" />
                  <TranscriptViewerScrubBar className="flex-1" />
                </div>
              </TranscriptViewerContainer>
            ) : (
              /* Fallback: plain text display when no word timing data */
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <audio
                    ref={audioRef}
                    src={result.audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          audioRef.current?.pause();
                        } else {
                          audioRef.current?.play();
                        }
                      }}
                      className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause size={16} className="text-white dark:text-black" />
                      ) : (
                        <Play size={16} className="text-white dark:text-black ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-[#333] rounded-full">
                      <div className="w-0 h-full bg-black dark:bg-white rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg max-h-[300px] overflow-y-auto">
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{result.text}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Promo Banner */}
        <div className="flex items-center gap-6 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl mb-8 hover:border-gray-300 dark:hover:border-[#444] transition-colors">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-amber-600 flex items-center justify-center">
            <div className="text-[8px] text-white font-medium text-center leading-tight px-1">
              <span className="opacity-80">Scribe v2</span>
              <br />
              <span className="text-[10px] font-semibold">Realtime</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Try Scribe Realtime v2</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Experience lightning fast transcription with unmatched accuracy, across 92 languages.
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#333] hover:border-gray-300 dark:hover:border-[#444] transition-colors flex-shrink-0">
            Try the demo
          </button>
        </div>

        {/* Usage Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{remainingTranscriptions}</span> transcriptions remaining this period
          </p>
        </div>

        {/* History Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transcriptions</h2>
          {history && history.total > 0 && (
            <Link
              href="/stt/history"
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Hidden audio element for history playback */}
        <audio ref={historyAudioRef} onEnded={() => setPlayingHistoryId(null)} />

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search transcripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-300 dark:focus:border-[#444] focus:ring-1 focus:ring-gray-200 dark:focus:ring-0"
          />
        </div>

        {/* History Error */}
        {historyError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-300">{historyError}</p>
          </div>
        )}

        {/* Loading State */}
        {historyLoading && !history && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Empty State */}
        {!historyLoading && history && history.transcriptions.length === 0 && (
          <div className="py-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No transcriptions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Upload an audio or video file to get started
            </p>
          </div>
        )}

        {/* Table Header */}
        {filteredTranscriptions.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div>File</div>
              <div>Duration</div>
              <div>Created</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100 dark:divide-[#333] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden">
              {filteredTranscriptions.map((transcript) => (
                <div
                  key={transcript.id}
                  className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-4 py-4 items-center hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group bg-white dark:bg-[#0a0a0a]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {transcript.originalFileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {transcript.textPreview || "(no text)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    {formatSeconds(transcript.duration)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(transcript.createdAt)}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toggleHistoryPlay(transcript)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                      title={playingHistoryId === transcript.id ? "Pause" : "Play"}
                    >
                      {playingHistoryId === transcript.id ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(transcript.id)}
                      disabled={deletingId === transcript.id}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === transcript.id ? (
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-[#333]">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {history.page} of {history.totalPages} ({history.total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchHistory(history.page - 1)}
                    disabled={history.page <= 1 || historyLoading}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchHistory(history.page + 1)}
                    disabled={history.page >= history.totalPages || historyLoading}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* No search results */}
        {searchQuery && filteredTranscriptions.length === 0 && history && history.transcriptions.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transcriptions match &quot;{searchQuery}&quot;</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
