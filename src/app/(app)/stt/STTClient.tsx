"use client";

import { useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  Search,
  FileText,
  MoreHorizontal,
  Loader2,
  Copy,
  Download,
  Play,
  Pause,
} from "lucide-react";

import { PLANS, STT_CONFIG } from "@/constants";

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
};

// Sample transcripts for display
const sampleTranscripts = [
  { title: "Product Launch Presentation", createdAt: "2 hours ago" },
  { title: "Quarterly Business Review Meeting", createdAt: "5 hours ago" },
  { title: "Customer Interview Session", createdAt: "yesterday" },
  { title: "Podcast Episode 42: Future of AI", createdAt: "3 days ago" },
  { title: "Team Training Workshop", createdAt: "last week" },
];

function formatSeconds(seconds: number): string {
  const s = Math.max(0, seconds || 0);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function STTClient({ userPlan = "free", currentUsage }: STTClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const limits = PLANS[userPlan];
  const remainingTranscriptions = Math.max(
    0,
    limits.maxTranscriptions - (currentUsage?.transcriptionsUsed ?? 0)
  );

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
        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-black">Speech to text</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FileText size={16} />
            Transcribe files
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

        <p className="text-gray-600 mb-8">
          Transcribe audio and video files with our{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-black">
            industry-leading ASR model
          </span>
          .
        </p>

        {/* File Selected */}
        {file && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="flex items-center gap-3">
                {fileTooLarge && (
                  <span className="text-sm text-red-500">File too large (max {STT_CONFIG.maxFileSizeMB}MB)</span>
                )}
                {invalidExtension && (
                  <span className="text-sm text-red-500">Invalid format</span>
                )}
                <button
                  onClick={handleTranscribe}
                  disabled={!canSubmit}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    canSubmit
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* Transcription Result */}
        {result && (
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Transcription Result</h3>
                <p className="text-sm text-gray-500">
                  Duration: {formatSeconds(result.duration)} • Language: {result.language}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
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
                  className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={16} className="text-white" />
                  ) : (
                    <Play size={16} className="text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1 h-1 bg-gray-200 rounded-full">
                  <div className="w-0 h-full bg-black rounded-full" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="p-4 bg-gray-50 rounded-lg max-h-[300px] overflow-y-auto">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{result.text}</p>
            </div>
          </div>
        )}

        {/* Promo Banner */}
        <div className="flex items-center gap-6 p-4 bg-white border border-gray-200 rounded-xl mb-8 hover:border-gray-300 transition-colors">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-amber-600 flex items-center justify-center">
            <div className="text-[8px] text-white font-medium text-center leading-tight px-1">
              <span className="opacity-80">Scribe v2</span>
              <br />
              <span className="text-[10px] font-semibold">Realtime</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">Try Scribe Realtime v2</h3>
            <p className="text-sm text-gray-500">
              Experience lightning fast transcription with unmatched accuracy, across 92 languages.
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0">
            Try the demo
          </button>
        </div>

        {/* Usage Info */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{remainingTranscriptions}</span> transcriptions remaining this period
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcripts..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_150px_50px] gap-4 px-4 py-3 text-xs font-medium text-gray-500">
          <div>Title</div>
          <div>Created at</div>
          <div></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {sampleTranscripts.map((transcript, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_150px_50px] gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors group"
              style={{ opacity: 1 - index * 0.15 }}
            >
              <div className="text-sm text-gray-900">{transcript.title}</div>
              <div className="text-sm text-gray-500">{transcript.createdAt}</div>
              <div className="flex justify-end">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
