"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
} from "@/components/ui/audio-player";
import Aurora from "@/components/Aurora";
import type { ProviderType } from "@/lib/providers/types";

interface VoicePreview {
  generatedVoiceId: string;
  audioBase64: string;
  mediaType: string;
}

export function VoiceDesignClient() {
  const router = useRouter();

  const [provider, setProvider] = useState<ProviderType>("elevenlabs");
  const [step, setStep] = useState<"design" | "preview" | "save">("design");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [sampleText, setSampleText] = useState(
    "Hello! This is a sample of my voice. I can speak clearly and naturally, with warmth and confidence. Let me show you how versatile and expressive I can be."
  );
  const [voiceName, setVoiceName] = useState("");
  const [previews, setPreviews] = useState<VoicePreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePreviews = async () => {
    if (!voiceDescription.trim()) {
      setError("Please describe the voice you want to create");
      return;
    }
    if (!sampleText.trim()) {
      setError("Please enter sample text for the voice to speak");
      return;
    }
    if (sampleText.trim().length < 100) {
      setError("Sample text must be at least 100 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voices/design/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          voiceDescription: voiceDescription.trim(),
          sampleText: sampleText.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate voice previews");
      }

      const data = await res.json();
      setPreviews(data.previews || []);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate previews");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreview = (generatedVoiceId: string) => {
    setSelectedPreview(generatedVoiceId);
  };

  const handleSaveVoice = async () => {
    if (!selectedPreview) {
      setError("Please select a voice preview");
      return;
    }
    if (!voiceName.trim()) {
      setError("Please enter a name for your voice");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/voices/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          voiceName: voiceName.trim(),
          voiceDescription: voiceDescription.trim(),
          generatedVoiceId: selectedPreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save voice");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/voices/my-voices");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save voice");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("design");
      setPreviews([]);
      setSelectedPreview(null);
    } else if (step === "save") {
      setStep("preview");
    }
  };

  const handleContinue = () => {
    if (step === "preview" && selectedPreview) {
      setStep("save");
    }
  };

  const stepLabels = ["Design", "Preview", "Save"];
  const stepKeys: Array<"design" | "preview" | "save"> = ["design", "preview", "save"];
  const currentStepIndex = stepKeys.indexOf(step);

  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <div
        className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Aurora
          colorStops={["#3b0764", "#7c3aed", "#a78bfa"]}
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
            <Sparkles className="h-8 w-8 text-purple-500" />
            Design a Voice
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {step === "design" && "Describe the voice you want to create and we'll generate it for you."}
            {step === "preview" && "Listen to the generated voices and select your favorite."}
            {step === "save" && "Give your new voice a name to save it."}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= currentStepIndex
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-[#222] text-gray-500 dark:text-gray-400"
                }`}
              >
                {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm ${
                  i <= currentStepIndex
                    ? "text-black dark:text-white font-medium"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  className={`w-8 h-px ${
                    i < currentStepIndex ? "bg-purple-600" : "bg-gray-200 dark:bg-[#333]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-4">
                <CheckCircle2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">Voice Created!</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your designed voice &quot;{voiceName}&quot; is ready to use.
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

              {step === "design" && (
                <>
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
                    <Label htmlFor="voice-description">Voice Description *</Label>
                    <Textarea
                      id="voice-description"
                      placeholder="e.g., A warm, friendly female voice with a slight British accent. She speaks at a moderate pace with clear enunciation."
                      value={voiceDescription}
                      onChange={(e) => setVoiceDescription(e.target.value)}
                      disabled={loading}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Be specific about gender, age, accent, tone, and speaking style.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sample-text">Sample Text *</Label>
                      <span className={`text-xs ${sampleText.trim().length < 100 ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                        {sampleText.trim().length}/100 min
                      </span>
                    </div>
                    <Textarea
                      id="sample-text"
                      placeholder="Enter text for the voice to speak in the preview (minimum 100 characters)..."
                      value={sampleText}
                      onChange={(e) => setSampleText(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />
                  </div>

                  <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 text-sm text-purple-700 dark:text-purple-300">
                    <p className="font-medium">Voice description examples:</p>
                    <ul className="mt-1 text-xs space-y-1">
                      <li>&quot;A deep, authoritative male voice perfect for documentaries&quot;</li>
                      <li>&quot;A cheerful young woman with an American accent, great for commercials&quot;</li>
                      <li>&quot;A calm, soothing narrator voice for meditation apps&quot;</li>
                    </ul>
                  </div>
                </>
              )}

              {step === "preview" && (
                <AudioPlayerProvider>
                  <div className="space-y-3">
                    <Label>Select a Voice ({previews.length} options)</Label>
                    {previews.map((preview, index) => (
                      <div
                        key={preview.generatedVoiceId}
                        onClick={() => handleSelectPreview(preview.generatedVoiceId)}
                        className={`
                          flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer
                          transition-all hover:border-purple-300 dark:hover:border-purple-700
                          ${selectedPreview === preview.generatedVoiceId
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-[#333]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              ${selectedPreview === preview.generatedVoiceId
                                ? "bg-purple-500 text-white"
                                : "bg-gray-100 dark:bg-[#222]"
                              }
                            `}
                          >
                            {selectedPreview === preview.generatedVoiceId ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <span className="font-medium text-black dark:text-white">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-black dark:text-white">Voice Option {index + 1}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Click to select this voice
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <AudioPlayerButton
                            item={{
                              id: preview.generatedVoiceId,
                              src: `data:${preview.mediaType};base64,${preview.audioBase64}`,
                            }}
                          />
                          <AudioPlayerProgress className="w-20" />
                          <AudioPlayerTime />
                        </div>
                      </div>
                    ))}
                  </div>
                </AudioPlayerProvider>
              )}

              {step === "save" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="voice-name">Voice Name *</Label>
                    <Input
                      id="voice-name"
                      placeholder="e.g., Friendly Narrator"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-4">
                    <p className="text-sm font-medium text-black dark:text-white">Voice Summary</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {voiceDescription}
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {step !== "design" && (
                  <Button variant="outline" onClick={handleBack} disabled={loading || saving}>
                    Back
                  </Button>
                )}
                {step === "design" && (
                  <>
                    <Button variant="outline" onClick={() => router.push("/voices")} disabled={loading}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGeneratePreviews}
                      disabled={loading || !voiceDescription.trim() || !sampleText.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Previews
                        </>
                      )}
                    </Button>
                  </>
                )}
                {step === "preview" && (
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedPreview}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue
                  </Button>
                )}
                {step === "save" && (
                  <Button
                    onClick={handleSaveVoice}
                    disabled={saving || !voiceName.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save Voice
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
