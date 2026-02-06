"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  Loader2,
  Mic2,
  FileAudio,
  AlertCircle,
  CheckCircle2,
  Square,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveWaveform } from "@/components/ui/live-waveform";
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
} from "@/components/ui/audio-player";
import Aurora from "@/components/Aurora";
import type { ProviderType } from "@/lib/providers/types";

const MAX_FILES = 25;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/webm"];

export function VoiceCloneClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [provider, setProvider] = useState<ProviderType>("elevenlabs");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "record">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(audioBlob);
        setRecordedUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch {
      setError("Could not access microphone. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
  }, [recordedUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError(null);

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Please use MP3, WAV, or M4A files.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (files.length + validFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a voice name");
      return;
    }

    const hasUploadedFiles = files.length > 0;
    const hasRecording = recordedBlob !== null;

    if (!hasUploadedFiles && !hasRecording) {
      setError("Please upload audio files or record your voice");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("provider", provider);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (hasRecording && recordedBlob) {
        const recordingFile = new File([recordedBlob], "recording.webm", { type: "audio/webm" });
        formData.append("files", recordingFile);
      }

      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/voices/clone", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create voice clone");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/voices/my-voices");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create voice clone");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <div
        className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Aurora
          colorStops={["#064e3b", "#059669", "#34d399"]}
          amplitude={3}
          blend={0.7}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/voices"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Voices
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
            <Mic2 className="h-8 w-8 text-emerald-500" />
            Instant Voice Clone
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload audio samples to clone a voice. The more samples you provide, the better the clone quality.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">Voice Created!</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your voice clone &quot;{name}&quot; is ready to use.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Provider</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider("elevenlabs")}
                    disabled={loading}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      provider === "elevenlabs"
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222]"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    ElevenLabs
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider("minimax")}
                    disabled={loading}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      provider === "minimax"
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#222]"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Minimax
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-name">Voice Name *</Label>
                <Input
                  id="voice-name"
                  placeholder="e.g., My Voice Clone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-description">Description (optional)</Label>
                <Textarea
                  id="voice-description"
                  placeholder="Describe the voice characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Audio Samples *</Label>
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "upload" | "record")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" disabled={loading || isRecording}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </TabsTrigger>
                    <TabsTrigger value="record" disabled={loading}>
                      <Mic2 className="mr-2 h-4 w-4" />
                      Record
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-3">
                    <div
                      onClick={() => !loading && fileInputRef.current?.click()}
                      className={`
                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                        transition-colors hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20
                        ${files.length > 0 ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-gray-200 dark:border-[#333]"}
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Click to upload audio files
                      </p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        MP3, WAV, M4A up to 10MB each (max {MAX_FILES} files)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,.webm,audio/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={loading}
                    />

                    {files.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto mt-3">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileAudio className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm truncate text-black dark:text-white">{file.name}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFile(index)}
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="record" className="mt-3">
                    <div className="border border-gray-200 dark:border-[#333] rounded-lg p-4 space-y-4">
                      <div className="flex flex-col items-center">
                        <LiveWaveform
                          active={isRecording}
                          height={80}
                          barColor="hsl(var(--primary))"
                          className="w-full rounded-lg bg-muted/50"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {isRecording ? "Recording..." : recordedBlob ? "Recording saved" : "Click to start recording"}
                        </p>
                      </div>

                      <div className="flex justify-center gap-3">
                        {!isRecording && !recordedBlob && (
                          <Button
                            onClick={startRecording}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Mic2 className="mr-2 h-4 w-4" />
                            Start Recording
                          </Button>
                        )}
                        {isRecording && (
                          <Button
                            onClick={stopRecording}
                            variant="destructive"
                          >
                            <Square className="mr-2 h-4 w-4" />
                            Stop Recording
                          </Button>
                        )}
                        {recordedBlob && !isRecording && (
                          <>
                            <AudioPlayerProvider>
                              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <AudioPlayerButton
                                  item={{
                                    id: "recorded",
                                    src: recordedUrl || "",
                                  }}
                                />
                                <AudioPlayerProgress className="w-32" />
                                <AudioPlayerTime />
                                <span className="text-muted-foreground">/</span>
                                <AudioPlayerDuration />
                              </div>
                            </AudioPlayerProvider>
                            <Button
                              variant="outline"
                              onClick={clearRecording}
                              disabled={loading}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Clear
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Tips for best results:</p>
                <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                  <li>Use clear, high-quality recordings</li>
                  <li>Include 1-5 minutes of total audio</li>
                  <li>Avoid background noise and music</li>
                  <li>Use samples from a single speaker</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => router.push("/voices")} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !name.trim() || (files.length === 0 && !recordedBlob)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Mic2 className="mr-2 h-4 w-4" />
                      Create Voice
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
