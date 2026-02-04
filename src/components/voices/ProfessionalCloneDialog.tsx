"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Loader2,
  Crown,
  FileAudio,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Check,
  Mic,
  Square,
  Image as ImageIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PVC_CONFIG } from "@/constants";

type Step = "setup" | "upload" | "speakers" | "verification" | "training" | "complete";

interface Sample {
  sampleId: string;
  fileName: string;
  separationStatus: "pending" | "processing" | "completed" | "failed";
  speakers?: Speaker[];
  selectedSpeakerId?: string;
}

interface Speaker {
  speakerId: string;
  audioBase64?: string;
  mediaType?: string;
}

interface ProfessionalCloneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (voice: { voiceId: string; name: string }) => void;
}

export function ProfessionalCloneDialog({
  open,
  onOpenChange,
  onSuccess,
}: ProfessionalCloneDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Step state
  const [step, setStep] = useState<Step>("setup");

  // Setup step
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [description, setDescription] = useState("");

  // Voice ID (created in step 1)
  const [voiceId, setVoiceId] = useState<string | null>(null);

  // Upload step
  const [files, setFiles] = useState<File[]>([]);

  // Samples & speakers
  const [samples, setSamples] = useState<Sample[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Verification step
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Training step
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingState, setTrainingState] = useState<string>("not_started");

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("setup");
      setName("");
      setLanguage("en");
      setDescription("");
      setVoiceId(null);
      setFiles([]);
      setSamples([]);
      setPlayingId(null);
      setCaptchaImage(null);
      setIsRecording(false);
      setRecordedBlob(null);
      setTrainingProgress(0);
      setTrainingState("not_started");
      setLoading(false);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  // Poll for speaker separation status
  const pollSpeakerStatus = useCallback(async () => {
    if (!voiceId || samples.length === 0) return;

    const pendingSamples = samples.filter(
      (s) => s.separationStatus === "pending" || s.separationStatus === "processing"
    );

    if (pendingSamples.length === 0) return;

    for (const sample of pendingSamples) {
      try {
        const res = await fetch(
          `/api/voices/clone/professional/${voiceId}/samples/${sample.sampleId}/speakers`
        );
        if (res.ok) {
          const data = await res.json();
          setSamples((prev) =>
            prev.map((s) =>
              s.sampleId === sample.sampleId
                ? {
                    ...s,
                    separationStatus: data.data.status,
                    speakers: data.data.speakers,
                  }
                : s
            )
          );
        }
      } catch (err) {
        console.error("Error polling speaker status:", err);
      }
    }
  }, [voiceId, samples]);

  // Poll speaker status when in speakers step
  useEffect(() => {
    if (step !== "speakers") return;

    const interval = setInterval(pollSpeakerStatus, 5000);
    return () => clearInterval(interval);
  }, [step, pollSpeakerStatus]);

  // Poll training status
  const pollTrainingStatus = useCallback(async () => {
    if (!voiceId) return;

    try {
      const res = await fetch(
        `/api/voices/clone/professional/${voiceId}/status?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTrainingState(data.data.state);
        setTrainingProgress(data.data.progress || 0);

        if (data.data.state === "fine_tuned") {
          setStep("complete");
          setSuccess(true);
          setTimeout(() => {
            onSuccess?.({ voiceId, name });
            onOpenChange(false);
          }, 2000);
        } else if (data.data.state === "failed") {
          setError("Training failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error polling training status:", err);
    }
  }, [voiceId, name, description, onSuccess, onOpenChange]);

  // Poll training status when in training step
  useEffect(() => {
    if (step !== "training" || trainingState === "fine_tuned" || trainingState === "failed") {
      return;
    }

    const interval = setInterval(pollTrainingStatus, 10000);
    pollTrainingStatus(); // Initial poll
    return () => clearInterval(interval);
  }, [step, trainingState, pollTrainingStatus]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError(null);

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (!PVC_CONFIG.allowedMimeTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}`);
        continue;
      }
      if (file.size > PVC_CONFIG.maxSampleSize) {
        setError(`File too large: ${file.name}. Maximum size is 50MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (files.length + validFiles.length > PVC_CONFIG.maxSamples) {
      setError(`Maximum ${PVC_CONFIG.maxSamples} files allowed.`);
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 1: Create PVC voice
  const handleCreateVoice = async () => {
    if (!name.trim()) {
      setError("Please enter a voice name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voices/clone/professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), language, description: description.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create voice");
      }

      const data = await res.json();
      setVoiceId(data.data.voiceId);
      setStep("upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create voice");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload samples
  const handleUploadSamples = async () => {
    if (files.length === 0) {
      setError("Please upload at least one audio file");
      return;
    }

    if (!voiceId) {
      setError("Voice ID not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch(`/api/voices/clone/professional/${voiceId}/samples`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload samples");
      }

      const data = await res.json();
      setSamples(
        data.data.samples.map((s: { sampleId: string; fileName: string }) => ({
          ...s,
          separationStatus: "processing" as const,
        }))
      );
      setStep("speakers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload samples");
    } finally {
      setLoading(false);
    }
  };

  // Get speaker audio for playback
  const handlePlaySpeaker = async (sample: Sample, speaker: Speaker) => {
    const playKey = `${sample.sampleId}-${speaker.speakerId}`;

    if (playingId === playKey) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // If we don't have audio yet, fetch it
    if (!speaker.audioBase64) {
      try {
        const res = await fetch(
          `/api/voices/clone/professional/${voiceId}/samples/${sample.sampleId}/speakers/${speaker.speakerId}/audio`
        );
        if (res.ok) {
          const data = await res.json();
          // Update the speaker with audio data
          setSamples((prev) =>
            prev.map((s) =>
              s.sampleId === sample.sampleId
                ? {
                    ...s,
                    speakers: s.speakers?.map((sp) =>
                      sp.speakerId === speaker.speakerId
                        ? { ...sp, audioBase64: data.data.audioBase64, mediaType: data.data.mediaType }
                        : sp
                    ),
                  }
                : s
            )
          );
          speaker.audioBase64 = data.data.audioBase64;
          speaker.mediaType = data.data.mediaType;
        }
      } catch (err) {
        console.error("Error fetching speaker audio:", err);
        return;
      }
    }

    setPlayingId(playKey);
    if (audioRef.current && speaker.audioBase64) {
      audioRef.current.src = `data:${speaker.mediaType || "audio/mpeg"};base64,${speaker.audioBase64}`;
      audioRef.current.play().catch(() => setPlayingId(null));
    }
  };

  // Select speaker for a sample
  const handleSelectSpeaker = async (sample: Sample, speaker: Speaker) => {
    if (!voiceId) return;

    try {
      const res = await fetch(
        `/api/voices/clone/professional/${voiceId}/samples/${sample.sampleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedSpeakerIds: [speaker.speakerId] }),
        }
      );

      if (res.ok) {
        setSamples((prev) =>
          prev.map((s) =>
            s.sampleId === sample.sampleId
              ? { ...s, selectedSpeakerId: speaker.speakerId }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Error selecting speaker:", err);
    }
  };

  // Check if all samples have speakers selected (or only one speaker)
  const allSpeakersSelected = samples.every((s) => {
    if (s.separationStatus !== "completed") return false;
    if (!s.speakers || s.speakers.length === 0) return false;
    if (s.speakers.length === 1) return true; // Auto-selected
    return !!s.selectedSpeakerId;
  });

  // Step 3 -> 4: Move to verification
  const handleProceedToVerification = async () => {
    // Auto-select single speakers
    for (const sample of samples) {
      if (sample.speakers?.length === 1 && !sample.selectedSpeakerId) {
        await handleSelectSpeaker(sample, sample.speakers[0]);
      }
    }
    setStep("verification");
    // Fetch CAPTCHA
    fetchCaptcha();
  };

  // Fetch CAPTCHA image
  const fetchCaptcha = async () => {
    if (!voiceId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/voices/clone/professional/${voiceId}/verification/captcha`);
      if (res.ok) {
        const data = await res.json();
        setCaptchaImage(data.data.captchaImage);
      }
    } catch (err) {
      setError("Failed to load verification image");
    } finally {
      setLoading(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Failed to access microphone. Please allow microphone access.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Submit verification
  const handleSubmitVerification = async () => {
    if (!voiceId || !recordedBlob) {
      setError("Please record the verification audio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("recording", recordedBlob, "verification.webm");

      const res = await fetch(
        `/api/voices/clone/professional/${voiceId}/verification/captcha`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Verification failed");
      }

      // Move to training step
      setStep("training");
      // Start training
      await startTraining();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Start training
  const startTraining = async () => {
    if (!voiceId) return;

    try {
      const res = await fetch(`/api/voices/clone/professional/${voiceId}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: PVC_CONFIG.trainingModel }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start training");
      }

      setTrainingState("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start training");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStepNumber = () => {
    const steps: Step[] = ["setup", "upload", "speakers", "verification", "training", "complete"];
    return steps.indexOf(step) + 1;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <audio
          ref={audioRef}
          onEnded={() => setPlayingId(null)}
          onError={() => setPlayingId(null)}
        />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            Professional Voice Clone
          </DialogTitle>
          <DialogDescription>
            {step === "setup" && "Create a high-quality voice clone with professional training."}
            {step === "upload" && "Upload high-quality audio samples of the voice to clone."}
            {step === "speakers" && "Select the correct speaker from each audio sample."}
            {step === "verification" && "Verify you have permission to clone this voice."}
            {step === "training" && "Training your professional voice clone..."}
            {step === "complete" && "Your professional voice clone is ready!"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        {!success && (
          <div className="flex items-center gap-2 mb-4">
            {["setup", "upload", "speakers", "verification", "training"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepNumber() > i + 1
                      ? "bg-amber-600 text-white"
                      : getStepNumber() === i + 1
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {getStepNumber() > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      getStepNumber() > i + 1 ? "bg-amber-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center py-8">
            <div className="rounded-full bg-amber-100 p-4">
              <CheckCircle2 className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Voice Clone Complete!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your professional voice clone &quot;{name}&quot; is ready to use.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Setup */}
            {step === "setup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pvc-name">Voice Name *</Label>
                  <Input
                    id="pvc-name"
                    placeholder="e.g., My Professional Voice"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pvc-language">Language *</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {PVC_CONFIG.supportedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pvc-description">Description (optional)</Label>
                  <Textarea
                    id="pvc-description"
                    placeholder="Describe the voice characteristics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={2}
                  />
                </div>

                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  <p className="font-medium">Professional Voice Clone Requirements:</p>
                  <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                    <li>High-quality audio recordings (at least 5 minutes total)</li>
                    <li>Clear speech without background noise</li>
                    <li>Voice verification required (you must be the voice owner)</li>
                    <li>Training takes 10-30 minutes depending on audio length</li>
                  </ul>
                </div>
              </>
            )}

            {/* Step 2: Upload */}
            {step === "upload" && (
              <>
                <div className="space-y-2">
                  <Label>Audio Samples *</Label>
                  <div
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                      transition-colors hover:border-amber-500 hover:bg-amber-50/50
                      ${files.length > 0 ? "border-amber-300 bg-amber-50/30" : "border-gray-200"}
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload audio files</p>
                    <p className="mt-1 text-xs text-gray-400">
                      MP3, WAV, M4A, MP4 up to 50MB each (max {PVC_CONFIG.maxSamples} files)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.mp4,.flac,.ogg,.webm,audio/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={loading}
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileAudio className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
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
              </>
            )}

            {/* Step 3: Speaker Selection */}
            {step === "speakers" && (
              <>
                <div className="space-y-4">
                  {samples.map((sample) => (
                    <div key={sample.sampleId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{sample.fileName}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            sample.separationStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : sample.separationStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {sample.separationStatus === "completed"
                            ? "Ready"
                            : sample.separationStatus === "failed"
                            ? "Failed"
                            : "Processing..."}
                        </span>
                      </div>

                      {sample.separationStatus === "completed" && sample.speakers && (
                        <div className="space-y-2">
                          {sample.speakers.map((speaker, idx) => (
                            <div
                              key={speaker.speakerId}
                              onClick={() => handleSelectSpeaker(sample, speaker)}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                sample.selectedSpeakerId === speaker.speakerId ||
                                (sample.speakers?.length === 1)
                                  ? "border-amber-500 bg-amber-50"
                                  : "border-gray-200 hover:border-amber-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    sample.selectedSpeakerId === speaker.speakerId ||
                                    (sample.speakers?.length === 1)
                                      ? "bg-amber-500 text-white"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  {sample.selectedSpeakerId === speaker.speakerId ||
                                  (sample.speakers?.length === 1) ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <span className="text-sm">{idx + 1}</span>
                                  )}
                                </div>
                                <span className="text-sm">Speaker {idx + 1}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlaySpeaker(sample, speaker);
                                }}
                              >
                                {playingId === `${sample.sampleId}-${speaker.speakerId}` ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(sample.separationStatus === "pending" ||
                        sample.separationStatus === "processing") && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing audio for speakers...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 4: Verification */}
            {step === "verification" && (
              <>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Read the text shown in the image below and record yourself speaking it.
                      This verifies you have permission to clone this voice.
                    </p>
                  </div>

                  {loading && !captchaImage ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : captchaImage ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="border rounded-lg p-4 bg-white">
                        <img
                          src={`data:image/png;base64,${captchaImage}`}
                          alt="Verification text"
                          className="max-w-full h-auto"
                        />
                      </div>

                      <div className="flex flex-col items-center gap-2 w-full">
                        <p className="text-sm font-medium">
                          {recordedBlob ? "Recording complete" : "Record yourself reading the text above"}
                        </p>
                        <div className="flex items-center gap-2">
                          {!recordedBlob ? (
                            <Button
                              onClick={isRecording ? stopRecording : startRecording}
                              variant={isRecording ? "destructive" : "default"}
                              className={isRecording ? "" : "bg-amber-600 hover:bg-amber-700"}
                            >
                              {isRecording ? (
                                <>
                                  <Square className="mr-2 h-4 w-4" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="mr-2 h-4 w-4" />
                                  Start Recording
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setRecordedBlob(null)}
                            >
                              Re-record
                            </Button>
                          )}
                        </div>
                        {recordedBlob && (
                          <p className="text-xs text-green-600">Recording ready for submission</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-muted-foreground">Failed to load verification image</p>
                      <Button variant="outline" onClick={fetchCaptcha}>
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 5: Training */}
            {step === "training" && (
              <>
                <div className="space-y-4 py-4">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-amber-600" />
                    <h3 className="mt-4 text-lg font-semibold">Training in Progress</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This may take 10-30 minutes. You can close this dialog and check back later.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{Math.round(trainingProgress)}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    Status: {trainingState.replace(/_/g, " ")}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            {step === "setup" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateVoice}
                  disabled={loading || !name.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </>
            )}

            {step === "upload" && (
              <>
                <Button variant="outline" onClick={() => setStep("setup")} disabled={loading}>
                  Back
                </Button>
                <Button
                  onClick={handleUploadSamples}
                  disabled={loading || files.length === 0}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload & Continue"
                  )}
                </Button>
              </>
            )}

            {step === "speakers" && (
              <>
                <Button variant="outline" onClick={() => setStep("upload")} disabled={loading}>
                  Back
                </Button>
                <Button
                  onClick={handleProceedToVerification}
                  disabled={!allSpeakersSelected}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Continue to Verification
                </Button>
              </>
            )}

            {step === "verification" && (
              <>
                <Button variant="outline" onClick={() => setStep("speakers")} disabled={loading}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmitVerification}
                  disabled={loading || !recordedBlob}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Submit & Start Training"
                  )}
                </Button>
              </>
            )}

            {step === "training" && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close (Training Continues)
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
