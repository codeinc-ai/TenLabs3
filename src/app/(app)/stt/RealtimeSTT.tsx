"use client";

import { useState, useCallback } from "react";
import { useScribe } from "@elevenlabs/react";
import * as Sentry from "@sentry/nextjs";
import {
  Mic,
  MicOff,
  Loader2,
  Copy,
  Download,
  Trash2,
  Volume2,
} from "lucide-react";

interface RealtimeSTTProps {
  userPlan?: "free" | "pro";
}

export function RealtimeSTT({ userPlan: _userPlan = "free" }: RealtimeSTTProps) {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: () => {
      // Partial transcripts are handled automatically via scribe.partialTranscript
    },
    onCommittedTranscript: () => {
      // Committed transcripts are handled automatically via scribe.committedTranscripts
    },
    onCommittedTranscriptWithTimestamps: () => {
      // Optional: handle word-level timestamps
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Transcription error occurred";
      setError(message);
      Sentry.captureException(err);
    },
  });

  const fetchToken = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/stt/token");
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `Failed to get token (${res.status})`);
    }
    const data = await res.json();
    return data.token;
  }, []);

  const handleStart = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const token = await fetchToken();

      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to start");
      setError(e.message);
      Sentry.captureException(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStop = () => {
    scribe.disconnect();
  };

  const handleClear = () => {
    // Note: The scribe hook doesn't have a clear method, 
    // so we disconnect and let the user reconnect for a fresh session
    if (scribe.isConnected) {
      scribe.disconnect();
    }
  };

  const getFullTranscript = (): string => {
    const committed = scribe.committedTranscripts
      .map((t) => t.text)
      .join(" ");
    const partial = scribe.partialTranscript || "";
    return [committed, partial].filter(Boolean).join(" ").trim();
  };

  const handleCopy = async () => {
    const text = getFullTranscript();
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const text = getFullTranscript();
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `realtime-transcription-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasTranscript = scribe.committedTranscripts.length > 0 || scribe.partialTranscript;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!scribe.isConnected ? (
          <button
            onClick={handleStart}
            disabled={isConnecting}
            className="flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span className="font-medium">Connecting...</span>
              </>
            ) : (
              <>
                <Mic size={24} />
                <span className="font-medium">Start Recording</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-3 px-6 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors animate-pulse"
          >
            <MicOff size={24} />
            <span className="font-medium">Stop Recording</span>
          </button>
        )}
      </div>

      {/* Status indicator */}
      {scribe.isConnected && (
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Listening...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-500 dark:text-red-400 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transcription display */}
      <div className="p-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl min-h-[200px]">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-[#333]">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Transcription</span>
          </div>
          {hasTranscript && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                title="Copy transcript"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                title="Download transcript"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                title="Clear and restart"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Copy success message */}
        {copied && (
          <div className="mb-4 p-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm rounded-lg text-center">
            Copied to clipboard!
          </div>
        )}

        {/* Transcript content */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {/* Committed transcripts */}
          {scribe.committedTranscripts.map((transcript, index) => (
            <p key={transcript.id || index} className="text-gray-800 dark:text-gray-200">
              {transcript.text}
            </p>
          ))}

          {/* Partial transcript (live) */}
          {scribe.partialTranscript && (
            <p className="text-gray-500 dark:text-gray-400 italic">
              {scribe.partialTranscript}
            </p>
          )}

          {/* Empty state */}
          {!hasTranscript && !scribe.isConnected && (
            <div className="py-12 text-center">
              <Mic size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Ready to transcribe</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Click &quot;Start Recording&quot; to begin realtime transcription
              </p>
            </div>
          )}

          {/* Waiting for speech */}
          {!hasTranscript && scribe.isConnected && (
            <div className="py-12 text-center">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400">Waiting for speech...</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500">
        
       <p className="mt-1">Supports 99+ languages with automatic detection</p>
      </div>
    </div>
  );
}
