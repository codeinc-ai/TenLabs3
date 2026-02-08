"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useUser } from "@clerk/nextjs";
import {
  Upload,
  Mic,
  Download,
  Trash2,
  X,
  ChevronRight,
  RotateCcw,
  Play,
  Pause,
  Loader2,
  Search,
  Check,
  Volume2,
  Settings,
} from "lucide-react";

import { DEFAULT_VOICES, VOICE_CHANGER_CONFIG, PLANS } from "@/constants";
import { capturePosthogBrowserEvent } from "@/lib/posthogBrowser";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface VoiceChangerClientProps {
  userPlan?: "free" | "starter" | "creator" | "pro";
  currentUsage?: {
    voiceConversionsUsed: number;
    voiceConversionMinutesUsed: number;
  };
}

interface Voice {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
}

const voicesList: Voice[] = DEFAULT_VOICES.map((voice, index) => ({
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

const modelsList = VOICE_CHANGER_CONFIG.models;

/**
 * Voice Changer Client Component
 *
 * Allows users to upload audio and change the voice using ElevenLabs Speech-to-Speech API.
 * Features:
 * - Drag and drop file upload
 * - Voice selection
 * - Settings panel with sliders
 * - Audio player for result
 */
export function VoiceChangerClient({ userPlan = "free", currentUsage }: VoiceChangerClientProps) {
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

  // Settings state
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voicesList[0]);
  const [selectedModel, setSelectedModel] = useState(modelsList[0]);
  const [stability, setStability] = useState(VOICE_CHANGER_CONFIG.defaults.stability);
  const [similarity, setSimilarity] = useState(VOICE_CHANGER_CONFIG.defaults.similarityBoost);
  const [styleExaggeration, setStyleExaggeration] = useState(VOICE_CHANGER_CONFIG.defaults.styleExaggeration);
  const [removeNoise, setRemoveNoise] = useState(VOICE_CHANGER_CONFIG.defaults.removeBackgroundNoise);
  const [speakerBoost, setSpeakerBoost] = useState(VOICE_CHANGER_CONFIG.defaults.speakerBoost);

  // Dropdown state
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");

  // Generation state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [conversionId, setConversionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Plan limits
  const limits = PLANS[userPlan];
  const usedConversions = currentUsage?.voiceConversionsUsed ?? 0;
  const remainingConversions = limits.maxVoiceConversions - usedConversions;

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
    if (!VOICE_CHANGER_CONFIG.allowedFormats.includes(extension)) {
      return `Unsupported format. Allowed: ${VOICE_CHANGER_CONFIG.allowedFormats.join(", ")}`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > VOICE_CHANGER_CONFIG.maxFileSizeMB) {
      return `File too large. Maximum size: ${VOICE_CHANGER_CONFIG.maxFileSizeMB}MB`;
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
      setConversionId(null);
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
      setConversionId(null);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setAudioUrl(null);
    setConversionId(null);
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
        setConversionId(null);
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

  // Convert voice
  const convertVoice = async () => {
    if (!uploadedFile || remainingConversions <= 0) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setConversionId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("targetVoiceId", selectedVoice.id);
      formData.append("modelId", selectedModel.id);
      formData.append("stability", String(stability));
      formData.append("similarityBoost", String(similarity));
      formData.append("styleExaggeration", String(styleExaggeration));
      formData.append("removeBackgroundNoise", String(removeNoise));
      formData.append("speakerBoost", String(speakerBoost));

      const response = await fetch("/api/voice-changer", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to convert voice");
      }

      setConversionId(result.data.conversionId);
      setAudioUrl(result.data.audioUrl);

      capturePosthogBrowserEvent("voice_conversion_completed", {
        feature: "voice-changer",
        userId,
        voiceId: selectedVoice.id,
        modelId: selectedModel.id,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      Sentry.captureException(err);

      capturePosthogBrowserEvent("voice_conversion_failed", {
        feature: "voice-changer",
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
      a.download = `converted_${uploadedFile?.name || "audio"}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download audio");
    }
  };

  const resetSettings = () => {
    setStability(VOICE_CHANGER_CONFIG.defaults.stability);
    setSimilarity(VOICE_CHANGER_CONFIG.defaults.similarityBoost);
    setStyleExaggeration(VOICE_CHANGER_CONFIG.defaults.styleExaggeration);
    setRemoveNoise(VOICE_CHANGER_CONFIG.defaults.removeBackgroundNoise);
    setSpeakerBoost(VOICE_CHANGER_CONFIG.defaults.speakerBoost);
  };

  const filteredVoices = voicesList.filter(
    (voice) =>
      voice.name.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
      voice.category.toLowerCase().includes(voiceSearchQuery.toLowerCase())
  );

  const fileSizeMB = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) : 0;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={VOICE_CHANGER_CONFIG.allowedFormats.map((f) => `.${f}`).join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!uploadedFile ? (
            /* Upload Zone */
            <div className="w-full max-w-2xl">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer group ${
                  isDragging
                    ? "border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a]"
                    : "border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444] hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]/80"
                }`}
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-[#252525] rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-200 dark:group-hover:bg-[#333] transition-colors">
                  <Upload size={24} className="text-gray-500 dark:text-gray-400" />
                </div>

                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                  Click to upload, or drag and drop
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Audio files up to {VOICE_CHANGER_CONFIG.maxFileSizeMB}MB ({VOICE_CHANGER_CONFIG.allowedFormats.join(", ")})
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-gray-200 dark:bg-[#444]"></div>
                  <span className="text-sm text-gray-400 dark:text-gray-500">or</span>
                  <div className="h-px w-12 bg-gray-200 dark:bg-[#444]"></div>
                </div>

                {recordingError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{recordingError}</p>
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isRecording
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#252525] hover:border-gray-300 dark:hover:border-[#444]"
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
            </div>
          ) : (
            /* File Uploaded - Show Preview and Result */
            <div className="w-full max-w-2xl space-y-6">
              {/* Uploaded File Card */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-[#252525] rounded-lg flex items-center justify-center">
                      <Volume2 size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[300px]">
                        {uploadedFile.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{fileSizeMB} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-600 dark:text-red-300">
                    {error}
                  </div>
                )}

                {/* Result Audio Player */}
                {audioUrl && (
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayPause}
                        className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      </button>

                      {/* Progress Bar */}
                      <div className="flex-1">
                        <div
                          className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full cursor-pointer"
                          onClick={(e) => {
                            if (!audioRef.current || !duration) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            audioRef.current.currentTime = percent * duration;
                          }}
                        >
                          <div
                            className="h-full bg-black dark:bg-white rounded-full"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleDownload}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Another Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-dashed border-gray-300 dark:border-[#444] rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-[#555] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                + Upload another file
              </button>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-16 border-t border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile settings button - only visible on small screens */}
            <button
              onClick={() => setMobileSettingsOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] transition-colors"
              aria-label="Open settings"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-[#444] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-[#444]"></div>
            </div>
            <span>{remainingConversions} conversions remaining</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {uploadedFile && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {fileSizeMB} MB
              </span>
            )}

            <div className="flex items-center gap-2">
              {audioUrl && (
                <>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={clearFile}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>

            <button
              onClick={convertVoice}
              disabled={!uploadedFile || loading || remainingConversions <= 0}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                uploadedFile && !loading && remainingConversions > 0
                  ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  : "bg-gray-300 dark:bg-[#333] text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Converting...
                </span>
              ) : (
                "Convert voice"
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <aside className="w-[380px] bg-white dark:bg-black border-l border-gray-200 dark:border-[#1a1a1a] flex-col h-full overflow-y-auto flex-shrink-0 hidden lg:flex transition-colors">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#1a1a1a] px-6">
          <button className="py-4 mr-6 text-sm font-medium text-black dark:text-white border-b-2 border-black dark:border-white">
            Settings
          </button>
          <button className="py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            History
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">Voice</label>
            <div className="relative">
              <button
                onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#444] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {selectedVoice.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedVoice.name}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform ${
                    isVoiceDropdownOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Voice Dropdown */}
              {isVoiceDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg dark:shadow-none z-50 max-h-80 overflow-hidden">
                  <div className="p-2 border-b border-gray-100 dark:border-[#333]">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search voices..."
                        value={voiceSearchQuery}
                        onChange={(e) => setVoiceSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-60">
                    {filteredVoices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          setSelectedVoice(voice);
                          setIsVoiceDropdownOpen(false);
                          setVoiceSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {voice.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-medium text-gray-900 dark:text-white block">{voice.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{voice.category}</span>
                          </div>
                        </div>
                        {selectedVoice.id === voice.id && <Check size={16} className="text-black dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">Model</label>
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#444] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 rounded-full border border-black dark:border-white text-[10px] font-bold text-black dark:text-white">
                    V2
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedModel.name}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform ${
                    isModelDropdownOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg dark:shadow-none z-50">
                  {modelsList.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-1.5 py-0.5 rounded-full border border-black dark:border-white text-[10px] font-bold text-black dark:text-white">
                          V2
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                      </div>
                      {selectedModel.id === model.id && <Check size={16} className="text-black dark:text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings Sliders */}
          <div className="space-y-6">
            <SliderControl
              label="Stability"
              leftLabel="More variable"
              rightLabel="More stable"
              value={stability}
              onChange={setStability}
            />
            <SliderControl
              label="Similarity"
              leftLabel="Low"
              rightLabel="High"
              value={similarity}
              onChange={setSimilarity}
            />
            <SliderControl
              label="Style Exaggeration"
              leftLabel="None"
              rightLabel="Exaggerated"
              value={styleExaggeration}
              onChange={setStyleExaggeration}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black dark:text-white underline decoration-dotted underline-offset-4 decoration-gray-300 dark:decoration-gray-600 cursor-help">
                Remove Background Noise
              </span>
              <button
                onClick={() => setRemoveNoise(!removeNoise)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  removeNoise ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-[#333]"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white dark:bg-[#1a1a1a] rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    removeNoise ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black dark:text-white">Speaker boost</span>
              <button
                onClick={() => setSpeakerBoost(!speakerBoost)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  speakerBoost ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-[#333]"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white dark:bg-[#1a1a1a] rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    speakerBoost ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
              Reset values
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Settings Sheet - only for small screens */}
      <Sheet open={mobileSettingsOpen} onOpenChange={setMobileSettingsOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[380px] p-0 gap-0 bg-white dark:bg-black border-l border-gray-200 dark:border-[#1a1a1a] flex flex-col h-full overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex border-b border-gray-200 dark:border-[#1a1a1a] px-6 flex-shrink-0">
              <button className="py-4 mr-6 text-sm font-medium text-black dark:text-white border-b-2 border-black dark:border-white">
                Settings
              </button>
            </div>
            <div className="p-6 space-y-8">
              {/* Voice Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">Voice</label>
                <div className="relative">
                  <button
                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#444] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {selectedVoice.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedVoice.name}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform ${
                        isVoiceDropdownOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isVoiceDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg dark:shadow-none z-50 max-h-80 overflow-hidden">
                      <div className="p-2 border-b border-gray-100 dark:border-[#333]">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search voices..."
                            value={voiceSearchQuery}
                            onChange={(e) => setVoiceSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#0a0a0a] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-60">
                        {filteredVoices.map((voice) => (
                          <button
                            key={voice.id}
                            onClick={() => {
                              setSelectedVoice(voice);
                              setIsVoiceDropdownOpen(false);
                              setVoiceSearchQuery("");
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white text-xs font-bold`}
                              >
                                {voice.name.charAt(0)}
                              </div>
                              <div className="text-left">
                                <span className="text-sm font-medium text-gray-900 dark:text-white block">{voice.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{voice.category}</span>
                              </div>
                            </div>
                            {selectedVoice.id === voice.id && <Check size={16} className="text-black dark:text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">Model</label>
                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#444] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 rounded-full border border-black dark:border-white text-[10px] font-bold text-black dark:text-white">
                        V2
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedModel.name}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform ${
                        isModelDropdownOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg dark:shadow-none z-50">
                      {modelsList.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-1.5 py-0.5 rounded-full border border-black dark:border-white text-[10px] font-bold text-black dark:text-white">
                              V2
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                          </div>
                          {selectedModel.id === model.id && <Check size={16} className="text-black dark:text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Sliders */}
              <div className="space-y-6">
                <SliderControl
                  label="Stability"
                  leftLabel="More variable"
                  rightLabel="More stable"
                  value={stability}
                  onChange={setStability}
                />
                <SliderControl
                  label="Similarity"
                  leftLabel="Low"
                  rightLabel="High"
                  value={similarity}
                  onChange={setSimilarity}
                />
                <SliderControl
                  label="Style Exaggeration"
                  leftLabel="None"
                  rightLabel="Exaggerated"
                  value={styleExaggeration}
                  onChange={setStyleExaggeration}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black dark:text-white underline decoration-dotted underline-offset-4 decoration-gray-300 dark:decoration-gray-600 cursor-help">
                    Remove Background Noise
                  </span>
                  <button
                    onClick={() => setRemoveNoise(!removeNoise)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      removeNoise ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-[#333]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white dark:bg-[#1a1a1a] rounded-full absolute top-0.5 transition-transform shadow-sm ${
                        removeNoise ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black dark:text-white">Speaker boost</span>
                  <button
                    onClick={() => setSpeakerBoost(!speakerBoost)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      speakerBoost ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-[#333]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white dark:bg-[#1a1a1a] rounded-full absolute top-0.5 transition-transform shadow-sm ${
                        speakerBoost ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Reset */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={resetSettings}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset values
                </button>
              </div>
            </div>
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
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const percentage = value * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-black dark:text-white underline decoration-dotted underline-offset-4 decoration-gray-300 dark:decoration-gray-600 cursor-help">
          {label}
        </label>
        <span className="text-xs text-gray-400 dark:text-gray-500">{Math.round(percentage)}%</span>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div
        className="relative h-1.5 bg-gray-100 dark:bg-[#333] rounded-full group cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onChange(percent);
        }}
      >
        <div className="absolute h-full bg-black dark:bg-white rounded-full" style={{ width: `${percentage}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black dark:bg-white rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{
            left: `${percentage}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}
