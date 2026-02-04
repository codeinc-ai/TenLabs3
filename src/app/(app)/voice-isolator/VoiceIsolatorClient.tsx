"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useUser } from "@clerk/nextjs";
import {
  Upload,
  Mic,
  Download,
  Trash2,
  Play,
  Pause,
  Loader2,
  Volume2,
  AudioWaveform,
} from "lucide-react";

import { VOICE_ISOLATOR_CONFIG, PLANS } from "@/constants";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";

interface VoiceIsolatorClientProps {
  userPlan?: "free" | "pro";
  currentUsage?: {
    voiceIsolationsUsed: number;
    voiceIsolationMinutesUsed: number;
  };
}

/**
 * Voice Isolator Client Component
 *
 * Allows users to upload audio and remove background noise using ElevenLabs Audio Isolation API.
 * Features:
 * - Drag and drop file upload
 * - Recording support
 * - Audio player for result
 */
export function VoiceIsolatorClient({ userPlan = "free", currentUsage }: VoiceIsolatorClientProps) {
  const { user } = useUser();
  const userId = user?.id;
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Isolation state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isolationId, setIsolationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Plan limits
  const limits = PLANS[userPlan];
  const usedIsolations = currentUsage?.voiceIsolationsUsed ?? 0;
  const remainingIsolations = limits.maxVoiceIsolations - usedIsolations;

  // File upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!VOICE_ISOLATOR_CONFIG.allowedFormats.includes(extension)) {
      return `Unsupported format. Allowed: ${VOICE_ISOLATOR_CONFIG.allowedFormats.join(", ")}`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > VOICE_ISOLATOR_CONFIG.maxFileSizeMB) {
      return `File too large. Maximum size: ${VOICE_ISOLATOR_CONFIG.maxFileSizeMB}MB`;
    }
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setUploadedFile(file);
      setError(null);
      setAudioUrl(null);
      setIsolationId(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setUploadedFile(file);
      setError(null);
      setAudioUrl(null);
      setIsolationId(null);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setAudioUrl(null);
    setIsolationId(null);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Recording handlers
  const startRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordingError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (chunksRef.current.length === 0) return;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: blob.type,
        });

        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        setUploadedFile(file);
        setError(null);
        setAudioUrl(null);
        setIsolationId(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access microphone";
      setRecordingError(message);
      Sentry.captureException(err);
    }
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  // Isolate voice
  const isolateVoice = async () => {
    if (!uploadedFile || remainingIsolations <= 0) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setIsolationId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/voice-isolator", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to isolate voice");
      }

      setIsolationId(result.data.isolationId);
      setAudioUrl(result.data.audioUrl);

      capturePosthogBrowserEvent("voice_isolation_completed", {
        feature: "voice-isolator",
        userId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      Sentry.captureException(err);

      capturePosthogBrowserEvent("voice_isolation_failed", {
        feature: "voice-isolator",
        userId,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Audio player handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

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

  const handleDownload = async () => {
    if (!audioUrl) return;
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `isolated_${uploadedFile?.name || "audio"}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download audio");
    }
  };

  const fileSizeMB = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={VOICE_ISOLATOR_CONFIG.allowedFormats.map((f) => `.${f}`).join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="p-8 max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold text-black mb-2">Voice Isolator</h1>
        <p className="text-sm text-gray-500 mb-8">
          Remove background noise and isolate voices from audio files
        </p>

        {!uploadedFile ? (
          /* Drop Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer group mb-6 ${
              isDragging
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
              <Upload size={24} className="text-gray-500" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Click to upload, or drag and drop
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Audio or video files up to {VOICE_ISOLATOR_CONFIG.maxFileSizeMB}MB
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-gray-200"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="h-px w-12 bg-gray-200"></div>
            </div>

            {recordingError && (
              <p className="text-sm text-red-600 mb-4">{recordingError}</p>
            )}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Stop recording
                </>
              ) : (
                <>
                  <Mic size={16} />
                  Record audio
                </>
              )}
            </button>
          </div>
        ) : (
          /* File Uploaded - Show Preview and Result */
          <div className="space-y-6">
            {/* Uploaded File Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <AudioWaveform size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 truncate max-w-[400px]">
                      {uploadedFile.name}
                    </h4>
                    <p className="text-xs text-gray-500">{fileSizeMB} MB</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Result Audio Player */}
              {audioUrl && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex-1">
                      <div
                        className="h-1.5 bg-gray-200 rounded-full cursor-pointer"
                        onClick={(e) => {
                          if (!audioRef.current || !duration) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = (e.clientX - rect.left) / rect.width;
                          audioRef.current.currentTime = percent * duration;
                        }}
                      >
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Upload another file
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {remainingIsolations} isolations remaining
                </span>

                <button
                  onClick={isolateVoice}
                  disabled={!uploadedFile || loading || remainingIsolations <= 0}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    uploadedFile && !loading && remainingIsolations > 0
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Isolating voice...
                    </span>
                  ) : (
                    "Isolate voice"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
